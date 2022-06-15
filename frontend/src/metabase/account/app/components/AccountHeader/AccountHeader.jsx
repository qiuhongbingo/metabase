import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { t } from "ttag";
import Radio from "metabase/core/components/Radio";
import { PLUGIN_SHOW_CHANGE_PASSWORD_CONDITIONS } from "metabase/plugins";
import {
  AccountHeaderRoot,
  HeaderAvatar,
  HeaderSection,
  HeaderTitle,
  HeaderSubtitle,
} from "./AccountHeader.styled";

const propTypes = {
  user: PropTypes.object.isRequired,
  path: PropTypes.string,
  onChangeLocation: PropTypes.func,
};

const AccountHeader = ({ user, path, onChangeLocation }) => {
  const hasPasswordChange = useMemo(
    () => PLUGIN_SHOW_CHANGE_PASSWORD_CONDITIONS.every(f => f(user)),
    [user],
  );

  const tabs = useMemo(
    () => [
      { name: t`Profile`, value: "/account/profile" },
      ...(hasPasswordChange
        ? [{ name: t`Password`, value: "/account/password" }]
        : []),
      { name: t`Login History`, value: "/account/login-history" },
      { name: t`Notifications`, value: "/account/notifications" },
    ],
    [hasPasswordChange],
  );

  const userFullName = [user.first_name, user.last_name].join(" ").trim();

  return (
    <AccountHeaderRoot data-testid="account-header">
      <HeaderSection>
        <HeaderAvatar user={user} />
        {userFullName && <HeaderTitle>{userFullName}</HeaderTitle>}
        <HeaderSubtitle>{user.email}</HeaderSubtitle>
      </HeaderSection>
      <Radio
        value={path}
        variant="underlined"
        options={tabs}
        onChange={onChangeLocation}
      />
    </AccountHeaderRoot>
  );
};

AccountHeader.propTypes = propTypes;

export default AccountHeader;
