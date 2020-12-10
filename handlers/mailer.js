"use strict";
const nodemailer = require("nodemailer");

module.exports= {
    send: function(emailID){
        return new Promise(async(resolve, reject)=>{
            var rand = Date.now() + "";
            rand = rand.split('').slice(rand.length-4, rand.length).join('');
            //let testAccount = await nodemailer.createTestAccount();
            let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: "alexandrea60@ethereal.email",
                    pass: "TYyn4h39zEFzNZAKCk"
                },
            });
        
            let info = await transporter.sendMail({
                from: '<noreplyilluminati@example.com', // sender address
                to: emailID, // list of receivers
                subject: "Verification Email", // Subject line
                html: "<span>OTP: <b>" + rand + "</b>", // html body
            });
        
            console.log("Message sent: %s", info.messageId);
            
            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            resolve(rand);
        })
    }
}