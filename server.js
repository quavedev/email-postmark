/* global Package */

import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import postmark from 'postmark';
// eslint-disable-next-line import/no-unresolved
import { getSettings } from 'meteor/quave:settings';

const PACKAGE_NAME = 'quave:email-postmark';
const settings = getSettings({ packageName: PACKAGE_NAME });

if (!settings || !settings.apiToken) {
  throw new Meteor.Error(
    'email-postmark: Settings are missing, at least "apiToken" and "from" are required.'
  );
}

const client = new postmark.ServerClient(settings.apiToken);

export const getClient = () => client;

export const sendEmail = async ({ to, subject, content, from: fromParam }) => {
  const from = fromParam || settings.from;
  if (!from) {
    throw new Meteor.Error(
      'email-postmark: Inform a global "from" in the settings or on each call'
    );
  }
  return client.sendEmail({
    From: from,
    To: to,
    Subject: subject,
    HtmlBody: content,
    MessageStream: 'outbound',
  });
};

Email.customTransport = options => {
  const { to, subject, html } = options;
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
