/* global Package */

import {Meteor} from 'meteor/meteor';
import {Email} from 'meteor/email';
import postmark from 'postmark';
// eslint-disable-next-line import/no-unresolved
import {getSettings} from 'meteor/quave:settings';

const PACKAGE_NAME = 'quave:email-postmark';
const settings = getSettings({packageName: PACKAGE_NAME}) || {};

if (!settings.apiToken && !settings.devMode) {
  throw new Meteor.Error(
    'email-postmark: Settings are missing, at least "apiToken" and "from" are required.'
  );
}

function getClient() {
  if (settings.devMode) {
    return {
      sendEmail: ({
                    To,
                    Subject,
                    HtmlBody,
                  }) => {
        console.log(PACKAGE_NAME, `${To}:${Subject}`)
        if (!settings.devModeOnlySubject) {
          console.log(PACKAGE_NAME, HtmlBody)
        }
        Promise.resolve();
      },
    };
  }
  return new postmark.ServerClient(settings.apiToken);
}

const client = getClient();

export const getPostmarkClient = () => client;
export const createPostmarkClient = ({apiToken}) => new postmark.ServerClient(apiToken);

export const getPostmarkAccountClient = () => new postmark.AccountClient(settings.accountApiToken);
export const createPostmarkAccountClient = ({apiToken}) => new postmark.AccountClient(apiToken);

export const sendEmail = async ({
                                  to,
                                  subject,
                                  content,
                                  from: fromParam,
                                  postmarkClient: clientParam,
                                  ...rest
                                }) => {
  const postmarkClient = clientParam || client;
  const from = fromParam || settings.from;
  if (!from) {
    throw new Meteor.Error(
      'email-postmark: Inform a global "from" in the settings or on each call'
    );
  }
  return postmarkClient.sendEmail({
    From: from,
    To: to,
    Subject: subject,
    HtmlBody: content,
    MessageStream: 'outbound',
    ...rest,
  });
};

Email.customTransport = options => {
  const {to, subject, html} = options;
  const overrideOptions = Email.overrideOptionsBeforeSend
    ? Email.overrideOptionsBeforeSend(options)
    : {};
  sendEmail({
    to,
    subject,
    content: html,
    ...overrideOptions,
  })
    .then(() => {
      if (settings.isVerbose) {
        // eslint-disable-next-line no-console
        console.log(`Email sent to ${to}`);
      }
    })
    .catch(error => {
      if (Package['quave:logs']) {
        Package['quave:logs'].logger.error({
          message: `email-postmark: Error sending email to ${to}`,
          error,
        });
        return;
      }
      console.error(`email-postmark: Error sending email to ${to}`, error);
    });
};
