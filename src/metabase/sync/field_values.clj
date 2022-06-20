(ns metabase.sync.field-values
  "Logic for updating FieldValues for fields in a database."
  (:require [clojure.tools.logging :as log]
            [metabase.db :as mdb]
            [metabase.driver.sql.query-processor :as sql.qp]
            [metabase.models.field :refer [Field]]
            [metabase.models.field-values :as field-values :refer [FieldValues]]
            [metabase.sync.interface :as i]
            [metabase.sync.util :as sync-util]
            [metabase.util :as u]
            [metabase.util.i18n :refer [trs]]
            [schema.core :as s]
            [toucan.db :as db]))

(s/defn ^:private clear-field-values-for-field! [field :- i/FieldInstance]
  (when (db/exists? FieldValues :field_id (u/the-id field))
    (log/debug (format "Based on cardinality and/or type information, %s should no longer have field values.\n"
                       (sync-util/name-for-logging field))
               "Deleting FieldValues...")
    (field-values/clear-field-values-for-field! field)
    ::field-values/fv-deleted))

(s/defn ^:private update-field-values-for-field! [field :- i/FieldInstance]
  (log/debug (u/format-color 'green "Looking into updating FieldValues for %s" (sync-util/name-for-logging field)))
  (field-values/create-or-update-field-values! field))

(defn- update-field-value-stats-count [counts-map result]
  (if (instance? Exception result)
    (update counts-map :errors inc)
    (case result
      ::field-values/fv-created
      (update counts-map :created inc)
      ::field-values/fv-updated
      (update counts-map :updated inc)
      ::field-values/fv-deleted
      (update counts-map :deleted inc)

      counts-map)))

(defn- table->fields-to-scan
  [table]
  (db/select Field :table_id (u/the-id table), :active true, :visibility_type "normal"))

(s/defn update-field-values-for-table!
  "Update the advanced FieldValues for all Fields (as needed) for TABLE."
  [table :- i/TableInstance]
  (reduce (fn [fv-change-counts field]
            (let [result (sync-util/with-error-handling (format "Error updating field values for %s" (sync-util/name-for-logging field))
                           (if (field-values/field-should-have-field-values? field)
                             (update-field-values-for-field! field)
                             (clear-field-values-for-field! field)))]
              (update-field-value-stats-count fv-change-counts result)))
          {:errors 0, :created 0, :updated 0, :deleted 0}
          (table->fields-to-scan table)))

(s/defn ^:private update-field-values-for-database!
  [_database :- i/DatabaseInstance
   tables :- [i/TableInstance]]
  (apply merge-with + (map update-field-values-for-table! tables)))

(defn- update-field-values-summary [{:keys [created updated deleted errors]}]
  (trs "Updated {0} field value sets, created {1}, deleted {2} with {3} errors"
       updated created deleted errors))

(defn- delete-expired-advanced-field-values-summary [{:keys [deleted]}]
  (trs "Deleted {0} expired advanced fieldvalues" deleted))

(s/defn delete-expired-advanced-field-values-for-table!
  "Delete all expired advanced FieldValues for a table.
  For more info about advanced FieldValues, check the docs in [[metabase.models.field-values/field-values-types]]"
  [table :- i/TableInstance]
  (reduce (fn [acc field]
            (sync-util/with-error-handling (format "Error deleting expired advanced field values for %s" (sync-util/name-for-logging field))
              (let [conditions [:field_id   (:id field),
                                :type       [:not= :full],
                                :updated_at [:< (sql.qp/add-interval-honeysql-form
                                                  (mdb/db-type)
                                                  :%now
                                                  (- field-values/advanced-field-values-max-age)
                                                  :day)]]
                    rows-count (apply db/count FieldValues conditions)]
                (apply db/delete! FieldValues conditions)
                (+ acc rows-count))))
          0
          (table->fields-to-scan table)))

(s/defn ^:private delete-expired-advanced-field-values-for-database!
  [_database :- i/DatabaseInstance
   tables :- [i/TableInstance]]
  {:deleted (apply + (map delete-expired-advanced-field-values-for-table! tables))})

(defn ^:private make-sync-field-values-steps
  [tables]
  [(sync-util/create-sync-step "delete-expired-advanced-field-values"
                               #(delete-expired-advanced-field-values-for-database! % tables)
                               delete-expired-advanced-field-values-summary)
   (sync-util/create-sync-step "update-field-values"
                               #(update-field-values-for-database! % tables)
                               update-field-values-summary)])

(s/defn update-field-values!
  "Update the advanced FieldValues (distinct values for categories and certain other fields that are shown
   in widgets like filters) for the Tables in DATABASE (as needed)."
  [database :- i/DatabaseInstance]
  (sync-util/sync-operation :cache-field-values database (format "Cache field values in %s"
                                                                 (sync-util/name-for-logging database))
    (let [tables (sync-util/db->sync-tables database)]
     (sync-util/run-sync-operation "field values scanning" database (make-sync-field-values-steps tables)))))
