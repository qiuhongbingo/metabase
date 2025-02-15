import React, { ReactNode, useState } from "react";
import { t, jt } from "ttag";
import Icon from "metabase/components/Icon";
import Toggle from "metabase/core/components/Toggle";
import CopyWidget from "metabase/components/CopyWidget";
import Confirm from "metabase/components/Confirm";

import { getPublicEmbedHTML } from "metabase/public/lib/code";

import cx from "classnames";

import * as MetabaseAnalytics from "metabase/lib/analytics";
import {
  Description,
  Header,
  IconContainer,
  OptionHeader,
} from "./SharingPane.styled";

type Resource = {
  dashboard?: number;
  question?: number;
  public_uuid?: string;
};

type Extension = string | null;

interface SharingPaneProps {
  resource: Resource;
  resourceType: string;
  onCreatePublicLink: () => void;
  onDisablePublicLink: () => void;
  extensions: string[];
  getPublicUrl: (resource: Resource, extension?: Extension) => void;
  onChangeEmbedType: (embedType: string) => void;
  isAdmin: boolean;
  isPublicSharingEnabled: boolean;
  isApplicationEmbeddingEnabled: boolean;
}

export default function SharingPane({
  resource,
  resourceType,
  onCreatePublicLink,
  onDisablePublicLink,
  extensions = [],
  getPublicUrl,
  onChangeEmbedType,
  isAdmin,
  isPublicSharingEnabled,
  isApplicationEmbeddingEnabled,
}: SharingPaneProps) {
  const [extensionState, setExtension] = useState<Extension>(null);

  const publicLink = getPublicUrl(resource, extensionState);
  const iframeSource = getPublicEmbedHTML(getPublicUrl(resource));

  const shouldDisableEmbedding = !isAdmin || !isApplicationEmbeddingEnabled;

  const embeddingHelperText = getEmbeddingHelperText({
    isAdmin,
    isApplicationEmbeddingEnabled,
  });

  return (
    <div className="pt2 ml-auto mr-auto" style={{ maxWidth: 600 }}>
      {isAdmin && isPublicSharingEnabled && (
        <div className="pb2 mb4 border-bottom flex align-center">
          <Header>{t`Enable sharing`}</Header>
          <div className="ml-auto">
            {resource.public_uuid ? (
              <Confirm
                title={t`Disable this public link?`}
                content={t`This will cause the existing link to stop working. You can re-enable it, but when you do it will be a different link.`}
                action={() => {
                  MetabaseAnalytics.trackStructEvent(
                    "Sharing Modal",
                    "Public Link Disabled",
                    resourceType,
                  );
                  onDisablePublicLink();
                }}
              >
                <Toggle value={true} />
              </Confirm>
            ) : (
              <Toggle
                value={false}
                onChange={() => {
                  MetabaseAnalytics.trackStructEvent(
                    "Sharing Modal",
                    "Public Link Enabled",
                    resourceType,
                  );
                  onCreatePublicLink();
                }}
              />
            )}
          </div>
        </div>
      )}

      <SharingOption
        className={cx({
          disabled: !resource.public_uuid,
        })}
        illustration={
          <IconContainer>
            <Icon name="link" size={32} />
          </IconContainer>
        }
      >
        <OptionHeader className="text-brand">{t`Public link`}</OptionHeader>
        <Description className="mb1">{t`Share this ${resourceType} with people who don't have a Metabase account using the URL below:`}</Description>
        <CopyWidget value={publicLink} />
        {extensions && extensions.length > 0 && (
          <div className="mt1">
            {extensions.map(extension => (
              <span
                key={extension}
                className={cx(
                  "cursor-pointer text-brand-hover text-bold text-uppercase",
                  extension === extensionState ? "text-brand" : "text-light",
                )}
                onClick={() =>
                  setExtension(extensionState =>
                    extension === extensionState ? null : extension,
                  )
                }
              >
                {extension}{" "}
              </span>
            ))}
          </div>
        )}
      </SharingOption>

      <SharingOption
        className={cx({
          disabled: !resource.public_uuid,
        })}
        illustration={
          <ResponsiveImage imageUrl="app/assets/img/simple_embed.png" />
        }
      >
        <OptionHeader className="text-green">{t`Public embed`}</OptionHeader>
        <Description className="mb1">{t`Embed this ${resourceType} in blog posts or web pages by copying and pasting this snippet:`}</Description>
        <CopyWidget value={iframeSource} />
      </SharingOption>

      <SharingOption
        className={cx({
          disabled: shouldDisableEmbedding,
          "cursor-pointer": !shouldDisableEmbedding,
        })}
        illustration={
          <ResponsiveImage imageUrl="app/assets/img/secure_embed.png" />
        }
        onClick={() => {
          if (!shouldDisableEmbedding) {
            onChangeEmbedType("application");
          }
        }}
      >
        <OptionHeader className="text-purple">{t`Embed this ${resourceType} in an application`}</OptionHeader>
        <Description>{t`By integrating with your application server code, you can provide a secure stats ${resourceType} limited to a specific user, customer, organization, etc.`}</Description>
        {embeddingHelperText && (
          <Description enableMouseEvents>{embeddingHelperText}</Description>
        )}
      </SharingOption>
    </div>
  );
}

interface SharingOptionProps {
  className: string;
  onClick?: () => void;
  illustration: ReactNode;
  children: ReactNode;
}

function SharingOption({
  className,
  onClick,
  illustration,
  children,
}: SharingOptionProps) {
  return (
    <div className={cx("mb4 flex align-start", className)} onClick={onClick}>
      {illustration}
      <div className="ml2">{children}</div>
    </div>
  );
}

function ResponsiveImage({ imageUrl }: { imageUrl: string }) {
  return <img width={100} src={imageUrl} srcSet={getSrcSet(imageUrl)} />;
}

const imageRegExp = /(?<baseUrl>.*)(?<extension>\.[A-z]{3,4})/;
function getSrcSet(imageUrl: string) {
  const { baseUrl, extension } = imageRegExp.exec(imageUrl)?.groups as {
    baseUrl: string;
    extension: string;
  };

  return `${baseUrl}${extension} 1x, ${baseUrl}@2x${extension} 2x`;
}

function getEmbeddingHelperText({
  isAdmin,
  isApplicationEmbeddingEnabled,
}: {
  isAdmin: boolean;
  isApplicationEmbeddingEnabled: boolean;
}) {
  if (!isAdmin) {
    return t`Only Admins are able to embed questions. If you need access to this feature, reach out to them for permissions.`;
  }

  if (!isApplicationEmbeddingEnabled && isAdmin) {
    return jt`In order to embed your question, you have to first ${(
      <a
        className="link"
        href="/admin/settings/embedding_in_other_applications"
      >
        enable embedding in your Admin settings.
      </a>
    )}`;
  }

  return null;
}
