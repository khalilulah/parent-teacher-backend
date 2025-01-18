const User = require("../models/userModel");
const sendMail = require("./sendMail");
const jwt = require("jsonwebtoken");

/**
 * Sends a verification code email to the specified email address.
 *
 * @param {string} email - The email address to send the verification code to.
 * @param {string} verificationCode - The verification code to be included in the email.
 * @returns {Promise<void>} A Promise representing the completion of the email sending process.
 */
const sendEmailVerification = async (res, trimmedEmail, verificationCode) => {
  try {
    // HTML message for email verification
    const htmlMessage = `
      <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900"
        rel="stylesheet" type="text/css"><!--<![endif]-->
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
        }

        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
        }

        p {
            line-height: inherit
        }

        .desktop_hide,
        .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
        }

        .image_block img+div {
            display: none;
        }

        sup,
        sub {
            font-size: 75%;
            line-height: 0;
        }

        .menu_block.desktop_hide .menu-links span {
            mso-hide: all;
        }

        .menu-links{
            line-height: 1.4;
        }

        @media (max-width:520px) {
            .desktop_hide table.icons-inner {
                display: inline-block !important;
            }

            .icons-inner {
                text-align: center;
            }

            .icons-inner td {
                margin: 0 auto;
            }

            .mobile_hide {
                display: none;
            }

            .row-content {
                width: 100% !important;
            }

            .stack .column {
                width: 100%;
                display: block;
            }

            .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
            }

            .desktop_hide,
            .desktop_hide table {
                display: table !important;
                max-height: none !important;
            }

            .row-1 .column-2 .block-1.paragraph_block td.pad>div {
                text-align: right !important;
            }

            .row-1 .column-2 .block-1.paragraph_block td.pad {
                padding: 0 16px 0 0 !important;
            }

            .row-3 .column-1 .block-1.menu_block .alignment,
            .row-3 .column-1 .block-2.menu_block .alignment,
            .row-3 .column-1 .block-3.menu_block .alignment,
            .row-3 .column-1 .block-4.menu_block .alignment,
            .row-3 .column-1 .block-5.menu_block .alignment,
            .row-3 .column-1 .block-6.menu_block .alignment {
                text-align: center !important;
            }

            .row-1 .column-1 {
                padding: 16px !important;
            }

            .row-2 .column-1 {
                padding: 5px 16px !important;
            }
        }
    </style>
    <!--[if mso ]><style>sup, sub { font-size: 100% !important; } sup { mso-text-raise:10% } sub { mso-text-raise:-10% }</style> <![endif]-->
</head>

<body class="body"
    style="background-color: #FFFFFF; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF;">
        <tbody>
            <tr>
                <td>
                    <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                        role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content" align="center" border="0" cellpadding="0" cellspacing="0"
                                        role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 500px; margin: 0 auto;"
                                        width="500">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="50%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <table class="image_block block-1" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad"
                                                                style="width:100%;padding-right:0px;padding-left:0px;">
                                                                <div class="alignment" align="left"
                                                                    style="line-height:10px">
                                                                    <div style="max-width: 88px;"><img
                                                                            src="https://app.mypathfinder.ai/pathFindersLogo.png"
                                                                            style="display: block; height: auto; border: 0; width: 100%;"
                                                                            width="88" alt="Logo" title="Logo" height="auto"></div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td class="column column-2" width="50%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: middle; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <table class="paragraph_block block-1" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div
                                                                    style="color:#000;direction:ltr;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;font-size:10px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:right;mso-line-height-alt:12px;">
                                                                    <p style="margin: 0;">...find your path</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                        role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0"
                                        cellspacing="0" role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px; margin: 0 auto;"
                                        width="500">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1"
                                                        style="height:22px;line-height:22px;font-size:1px;">&#8202;
                                                    </div>
                                                    <table class="heading_block block-2" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad" style="text-align:center;width:100%;">
                                                                <h1
                                                                    style="margin: 0; color: #000; direction: ltr; font-family: 'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif; font-size: 25px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 30px;">
                                                                    Your OTP Code</h1>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <div class="spacer_block block-3"
                                                        style="height:22px;line-height:22px;font-size:1px;">&#8202;
                                                    </div>
                                                    <table class="paragraph_block block-4" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div
                                                                    style="color:#101112;direction:ltr;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;font-size:14px;font-weight:500;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                                                    <p style="margin: 0;">Hello,</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <div class="spacer_block block-5"
                                                        style="height:15px;line-height:15px;font-size:1px;">&#8202;
                                                    </div>
                                                    <table class="paragraph_block block-6" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div
                                                                    style="color:#101112;direction:ltr;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;font-size:14px;font-weight:500;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                                                    <p style="margin: 0;">Your One-Time Password (OTP)
                                                                        is:</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table class="paragraph_block block-7" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div
                                                                    style="color:#101112;direction:ltr;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;font-size:16px;font-weight:600;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:24px;">
                                                                    <p style="margin: 0;">${verificationCode}</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <div class="spacer_block block-8"
                                                        style="height:1px;line-height:1px;font-size:1px;">&#8202;</div>
                                                    <table class="paragraph_block block-9" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div
                                                                    style="color:#101112;direction:ltr;font-family:'Montserrat', 'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif;font-size:14px;font-weight:500;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                                                    <p style="margin: 0;">This code is valid for 10
                                                                        minutes. Please do not share this code with
                                                                        anyone for your security.</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <div class="spacer_block block-10"
                                                        style="height:22px;line-height:22px;font-size:1px;">&#8202;
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                        role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0"
                                        cellspacing="0" role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; background-color: #e6f0ff; border-radius: 8px; width: 500px; margin: 0 auto;"
                                        width="500">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-left: 20px; padding-right: 20px; padding-top: 20px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <table class="menu_block block-1" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad"
                                                                style="color:#444a5b;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:10px;font-weight:400;text-align:center;">
                                                                <table width="100%" cellpadding="0" cellspacing="0"
                                                                    border="0" role="presentation"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="alignment"
                                                                            style="text-align:center;font-size:0px;">
                                                                            <div class="menu-links">
                                                                                <!--[if mso]><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style=""><tr style="text-align:center;"><![endif]--><!--[if mso]><td style="padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:5px"><![endif]--><span
                                                                                    class="label"
                                                                                    style="word-break: break-word; mso-hide: false; padding-top: 0px; padding-bottom: 0px; padding-left: 5px; padding-right: 0px; display: inline; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 10px; color: false; letter-spacing: normal;">Got
                                                                                    a
                                                                                    question?</span><!--[if mso]></td><![endif]--><!--[if mso]><td style="padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:5px"><![endif]--><span
                                                                                    class="label"
                                                                                    style="word-break: break-word; mso-hide: false; text-decoration: underline; padding-top: 0px; padding-bottom: 0px; padding-left: 5px; padding-right: 0px; display: inline; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 10px; color: false; letter-spacing: normal;">Send
                                                                                    us a
                                                                                    message</span><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]-->
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table class="menu_block block-2" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad"
                                                                style="color:#444a5b;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:10px;font-weight:400;text-align:center;">
                                                                <table width="100%" cellpadding="0" cellspacing="0"
                                                                    border="0" role="presentation"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="alignment"
                                                                            style="text-align:center;font-size:0px;">
                                                                            <div class="menu-links">
                                                                                <!--[if mso]><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style=""><tr style="text-align:center;"><![endif]--><!--[if mso]><td style="padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:5px"><![endif]--><span
                                                                                    class="label"
                                                                                    style="word-break: break-word; mso-hide: false; padding-top: 0px; padding-bottom: 0px; padding-left: 5px; padding-right: 0px; display: inline; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 10px; color: false; letter-spacing: normal;">©
                                                                                    2025 DTech Centrix Inc., All rights
                                                                                    reserved.</span><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]-->
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table class="menu_block block-3" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad"
                                                                style="color:#444a5b;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:10px;font-weight:400;text-align:center;">
                                                                <table width="100%" cellpadding="0" cellspacing="0"
                                                                    border="0" role="presentation"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="alignment"
                                                                            style="text-align:center;font-size:0px;">
                                                                            <div class="menu-links">
                                                                                <!--[if mso]><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style=""><tr style="text-align:center;"><![endif]--><!--[if mso]><td style="padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:5px"><![endif]--><span
                                                                                    class="label"
                                                                                    style="word-break: break-word; mso-hide: false; padding-top: 0px; padding-bottom: 0px; padding-left: 5px; padding-right: 0px; display: inline; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 10px; color: false; letter-spacing: normal;">5921
                                                                                    S Indiana Ave, Chicago, Illinois,
                                                                                    60637</span><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]-->
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table class="menu_block block-4" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad"
                                                                style="color:#444a5b;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:10px;font-weight:400;text-align:center;">
                                                                <table width="100%" cellpadding="0" cellspacing="0"
                                                                    border="0" role="presentation"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="alignment"
                                                                            style="text-align:center;font-size:0px;">
                                                                            <div class="menu-links">
                                                                                <!--[if mso]><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style=""><tr style="text-align:center;"><![endif]--><!--[if mso]><td style="padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:5px"><![endif]--><span
                                                                                    class="label"
                                                                                    style="word-break: break-word; mso-hide: false; padding-top: 0px; padding-bottom: 0px; padding-left: 5px; padding-right: 0px; display: inline; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 10px; color: false; letter-spacing: normal;">You
                                                                                    received this email because you're
                                                                                    subscribed to the MyPathfinder Blog
                                                                                    &
                                                                                    Newsletter.</span><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]-->
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table class="menu_block block-5" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad"
                                                                style="color:#444a5b;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:10px;font-weight:400;text-align:center;">
                                                                <table width="100%" cellpadding="0" cellspacing="0"
                                                                    border="0" role="presentation"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="alignment"
                                                                            style="text-align:center;font-size:0px;">
                                                                            <div class="menu-links">
                                                                                <!--[if mso]><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style=""><tr style="text-align:center;"><![endif]--><!--[if mso]><td style="padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:5px"><![endif]--><span
                                                                                    class="label"
                                                                                    style="word-break: break-word; mso-hide: false; padding-top: 0px; padding-bottom: 0px; padding-left: 5px; padding-right: 0px; display: inline; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 10px; color: false; letter-spacing: normal;">Want
                                                                                    to <span style="text-decoration: underline;">unsubscribe</span> or change which
                                                                                    emails you
                                                                                    receive?</span><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]-->
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table class="menu_block block-6" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad"
                                                                style="color:#444a5b;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:10px;font-weight:400;text-align:center;">
                                                                <table width="100%" cellpadding="0" cellspacing="0"
                                                                    border="0" role="presentation"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                    <tr>
                                                                        <td class="alignment"
                                                                            style="text-align:center;font-size:0px;">
                                                                            <div class="menu-links">
                                                                                <!--[if mso]><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style=""><tr style="text-align:center;"><![endif]--><!--[if mso]><td style="padding-top:0px;padding-right:5px;padding-bottom:0px;padding-left:5px"><![endif]--><span
                                                                                    class="label"
                                                                                    style="word-break: break-word; mso-hide: false; padding-top: 0px; padding-bottom: 0px; padding-left: 5px; padding-right: 5px; display: inline; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 10px; color: false; letter-spacing: normal; text-decoration: underline;">Privacy
                                                                                    policy</span><!--[if mso]></td><td><![endif]--><span
                                                                                    class="sep"
                                                                                    style="word-break: break-word; font-size: 10px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #444a5b;">|</span><!--[if mso]></td><![endif]--><!--[if mso]><td style="padding-top:0px;padding-right:5px;padding-bottom:0px;padding-left:5px"><![endif]--><span
                                                                                    class="label"
                                                                                    style="word-break: break-word; mso-hide: false; padding-top: 0px; padding-bottom: 0px; padding-left: 5px; padding-right: 5px; display: inline; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 10px; color: false; letter-spacing: normal; text-decoration: underline;">Contact
                                                                                    us</span><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]-->
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                        role="presentation"
                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0"
                                        cellspacing="0" role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; background-color: #ffffff; width: 500px; margin: 0 auto;"
                                        width="500">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <table class="icons_block block-1" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; text-align: center; line-height: 0;">
                                                        <tr>
                                                            <td class="pad"
                                                                style="vertical-align: middle; color: #1e0e4b; font-family: 'Inter', sans-serif; font-size: 15px; padding-bottom: 5px; padding-top: 5px; text-align: center;">
                                                                <!--[if vml]><table align="center" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
                                                                <!--[if !vml]><!-->
                                                                <table class="icons-inner"
                                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; padding-left: 0px; padding-right: 0px;"
                                                                    cellpadding="0" cellspacing="0" role="presentation">
                                                                    <!--<![endif]-->
                                                                    <tr>
                                                                        <td
                                                                            style="vertical-align: middle; text-align: center; padding-top: 5px; opacity: 0; padding-bottom: 5px; padding-left: 5px; padding-right: 6px;">
                                                                            <a href="http://designedwithbeefree.com/"
                                                                                target="_blank"
                                                                                style="text-decoration: none;"><img
                                                                                    class="icon" alt="Beefree Logo"
                                                                                    src="https://d1oco4z2z1fhwp.cloudfront.net/assets/Beefree-logo.png"
                                                                                    height="auto" width="34"
                                                                                    align="center"
                                                                                    style="display: block; height: auto; margin: 0 auto; border: 0;"></a>
                                                                        </td>
                                                                        <td
                                                                            style="font-family: 'Inter', sans-serif; font-size: 15px; opacity: 0; font-weight: undefined; color: #1e0e4b; vertical-align: middle; letter-spacing: undefined; text-align: center; line-height: normal;">
                                                                            <a href="http://designedwithbeefree.com/"
                                                                                target="_blank"
                                                                                style="color: #1e0e4b; text-decoration: none;">Designed
                                                                                with Beefree</a></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table><!-- End -->
</body>
</html>
      `;

    // Send verification code to user's email
    await sendMail({
      email: trimmedEmail,
      subject: "Verification code",
      html: htmlMessage,
    });
  } catch (error) {
    throw new Error(error);
  }
};

const sendResponse = (res, statusCode, message, data) => {
  return res.status(statusCode).json({
    message,
    data,
    status: statusCode === 200 || statusCode === 201 ? "SUCCESS" : "FAILED",
  });
};

/**
 * Middleware to verify the authenticity of JWT token in the request header.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const verifyToken = (req, res, next) => {
  try {
    // Extract authHeader from the request header
    const authHeader = req.headers.authorization;

    // If authHeader is not provided, send 401 Unauthorized response
    if (!authHeader) {
      return sendResponse(
        res,
        401,
        "You're not authenticated, please login",
        null
      );
    }

    // Check if token starts with "Bearer"
    if (!authHeader.startsWith("Bearer ")) {
      return sendResponse(res, 401, "Invalid token format", null);
    }

    // Extract the token part after "Bearer "
    const token = authHeader.split(" ")[1];

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
      if (err) {
        // If token is invalid, send 403 Forbidden response
        return sendResponse(
          res,
          403,
          "Invalid or expired token, please login",
          null
        );
      }

      // Attach decoded user data to request object for further use
      req.userData = userData;
      next();
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error verifying token:", error);
    // Send 500 Internal Server Error response
    return sendResponse(res, 500, "Internal Server Error", null);
  }
};

// /**
//  * Middleware to verify if the user calling the API is a super admin.
//  * @param {Object} req - Express request object.
//  * @param {Object} res - Express response object.
//  * @param {Function} next - Express next middleware function.
//  * @returns {void}
//  */
const verifySuperAdmin = async (req, res, next) => {
  try {
    // Call the verifyToken middleware to verify the authenticity of the JWT token
    verifyToken(req, res, async () => {
      // Extract the decoded token from the request object
      const decodedToken = req.userData?.userData;

      // Check if the user is a super admin
      const user = await User.findById(decodedToken._id);

      if (!user) {
        return sendResponse(res, 401, "User not found");
      }
      if (user.role !== "superAdmin") {
        return sendResponse(
          res,
          401,
          "You do not have permission to access this resource"
        );
      }

      // Attach decoded user data to request object for further use
      console.log(req.userData);

      // If the user is a super admin, call the next middleware
      next();
    });
  } catch (error) {
    // Handle token verification errors
    return sendResponse(
      res,
      403,
      "Invalid or expired token, please login",
      null
    );
  }
};

module.exports = {
  sendResponse,
  sendEmailVerification,
  verifyToken,
  verifySuperAdmin,
};
