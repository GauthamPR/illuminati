"use strict";
const nodemailer = require("nodemailer");
const transporterData = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: "alexandrea60@ethereal.email",
        pass: "TYyn4h39zEFzNZAKCk"
    }
};

module.exports= {
    sendOTP: function(emailID){
        return new Promise(async(resolve, reject)=>{
            var rand = Date.now() + "";
            rand = rand.split('').slice(rand.length-4, rand.length).join('');
            let transporter = nodemailer.createTransport(transporterData);
        
            let info = await transporter.sendMail({
                from: '<noreplyilluminati@example.com',
                to: emailID,
                subject: "Verification Email",
                html: "<span>OTP: <b>" + rand + "</b>",
            });
        
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            resolve(rand);
        })
    },

    sendResetLink: function (emailID){
        return new Promise(async(resolve, reject)=>{
            var rand = Date.now() + "";
            let transporter = nodemailer.createTransport(transporterData);
            var link = 'http://localhost:3000/reset-password/' + rand;
            let info = await transporter.sendMail({
                from: '<noreplyilluminati@example.com',
                to: emailID,
                subject: "Password Reset",
                html: "<span>Follow this link: <a href='" + link + "'>"+ link +"</a><span>",
            });
        
            console.log("Message sent: %s", info.messageId);        
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            resolve(rand);
        })
    }
}