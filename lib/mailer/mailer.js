import path from 'path';
import EmailTemplate from 'email-templates';
import nodemailer from 'nodemailer';
import emails from './emails';
import {EMAIL_TEMPLATES} from '../../utils/constants';

class Mailer {

    constructor(sender) {
        
        if(sender?.orgId){
            
            const configName = `config_${sender.orgId}`;
            const configMapping = JSON.parse(process.env[configName]).email;

            this.sender = configMapping.EMAIL_CONFIG_SENDER;

        }else{
            this.sender = process.env.EMAIL_CONFIG_SENDER;
        }
        
        this.transport = nodemailer.createTransport({
            "host": process.env.EMAIL_CONFIG_TRNASPORT_SMTP_HOST,
            "port": parseInt(process.env.EMAIL_CONFIG_TRNASPORT_SMTP_PORT, 10),
            "secure": process.env.EMAIL_CONFIG_TRNASPORT_SMTP_SECURE === 'true',
            "auth": {
                "user": process.env.EMAIL_CONFIG_TRNASPORT_SMTP_AUTH_USER,
                "pass": process.env.EMAIL_CONFIG_TRNASPORT_SMTP_AUTH_PASSWORD,
            }
        });
        this.emailTemplate = new EmailTemplate({
            message: {from: this.sender},
            send: true,
            transport: this.transport,
            views: {
                root: path.resolve(__dirname, 'emails'),
                options: {extension: 'pug'},
            },
            juice: true,
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    // this is the relative directory to your CSS/image assets
                    relativeTo: path.join(__dirname, '..', '..', 'public', 'stylesheets'),
                },
            },
        });
    }

    /**
     * Get email instance
     * @param {string} type Email type
     * @param {Object} options Options
     * @param {String} [options.sender] email sender
     * @param {Array}  [options.receivers] email receivers array
     * @param {Object} [options.data] email template input data
     * @return {Object} Email instance
     */
    getEmail(type, options = {}) {
        options.sender = options.sender || this.sender;
        options.emailTemplate = this.emailTemplate;
        return new emails[type](options);
    }

    /**
     * Method to send exception email
     */
    exceptionEmail(options) {
        return this.getEmail(EMAIL_TEMPLATES.EXCEPTION_EMAIL, options);
    }

    otpEmail(options){
        return this.getEmail(EMAIL_TEMPLATES.OTP_EMAIL, options)
    }
}

export default Mailer;
