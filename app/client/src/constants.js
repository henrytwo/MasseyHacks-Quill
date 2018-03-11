angular.module('reg')
    .constant('EVENT_INFO', {
        NAME: 'MasseyHacks IV',
    })
    .constant('DASHBOARD', {
        UNVERIFIED: 'It seems like you have not verified your email. You NEED to verify your email since we will be sending you all of the important information there and it would be a shame for it to end up in the wrong inbox.\nYou should have received an email asking you verify your email. Click the link in the email and you can start your application!',
        INCOMPLETE_TITLE: 'You still need to complete your application!',
        INCOMPLETE: 'It seems like your application is incomplete. We encourage you to complete your application in order to increase your chances of acceptance. We are eager to review your application and spots are limited so finish it quick!',
        SUBMITTED_TITLE: 'Your application has been submitted!',
        SUBMITTED: 'Your application has successfully been submitted and we are hard at work reviewing it. We will let you know during one of our acceptance waves if you have been accepted to attend MasseyHacks IV. If you are not accepted during the first acceptance wave after your submission, don’t worry as your application is automatically considered for our next wave.\n\nFeel free to edit it at any time. However, once registration is closed or a decision is made, you will not be able to edit it any further.\nPlease make sure your information is accurate before submitting!',
        CLOSED_AND_INCOMPLETE_TITLE: 'Unfortunately, registration has closed, and the review process has begun.',
        CLOSED_AND_INCOMPLETE: 'Because you have not completed your profile in time, your application was not processed.',
        ADMITTED_AND_CAN_CONFIRM: 'CONGRATULATIONS! Your application was outstanding and you have been accepted to attend MasseyHacks IV. Now your need to confirm your spot at the event. To do this click the RSVP button below and sign the waiver. Do this as soon as possible so you do not lose your spot.',
        ADMITTED_AND_CAN_CONFIRM_TITLE: 'You must confirm by [CONFIRM_DEADLINE].',
        ADMITTED_AND_CANNOT_CONFIRM_TITLE: 'Your confirmation deadline of [CONFIRM_DEADLINE] has passed.',
        ADMITTED_AND_CANNOT_CONFIRM: 'Although you were accepted, you did not complete your confirmation in time.\nUnfortunately, this means that you will not be able to attend the event, as we must begin to accept other applicants on the waitlist.\nWe hope to see you again next year!',
        CONFIRMED_NOT_PAST_TITLE: 'You can edit your confirmation information until [CONFIRM_DEADLINE]',
        DECLINED: 'We\'re sorry to hear that you won\'t be able to make it to MasseyHacks IV! :(\nMaybe next year! We hope you see you again soon.',
    })
    .constant('TEAM',{
        NO_TEAM_REG_CLOSED: 'Unfortunately, it\'s too late to apply with a team.\nHowever, you can still form teams on your own before or during the event!',
    });

