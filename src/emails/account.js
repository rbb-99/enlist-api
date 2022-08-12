import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from: process.env.SENDGRID_REGISTERED_MAIL_ID,
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancellationEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from: process.env.SENDGRID_REGISTERED_MAIL_ID,
        subject: 'Sorry to see you go!',
        text: `Goodbye ${name}. I hope to see you back sometime soon.`
    })
}

export default {
    sendWelcomeEmail,
    sendCancellationEmail
}
