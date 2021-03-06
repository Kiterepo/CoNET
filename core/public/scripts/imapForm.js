/*!
 * Copyright 2018 CoNET Technology Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const availableImapServer = /imap\-mail\.outlook\.com$|imap\.mail\.yahoo\.(com|co\.jp|co\.uk|au)$|imap\.mail\.me\.com$|imap\.gmail\.com$|gmx\.(com|us|net)$|imap\.zoho\.com$/i;
/**
 * 			getImapSmtpHost
 * 		@param email <string>
 * 		@return Imap & Smtp info
 */
const getImapSmtpHost = function (_email) {
    const email = _email.toLowerCase();
    const yahoo = function (domain) {
        if (/yahoo.co.jp$/i.test(domain))
            return 'yahoo.co.jp';
        if (/((.*\.){0,1}yahoo|yahoogroups|yahooxtra|yahoogruppi|yahoogrupper)(\..{2,3}){1,2}$/.test(domain))
            return 'yahoo.com';
        if (/(^hotmail|^outlook|^live|^msn)(\..{2,3}){1,2}$/.test(domain))
            return 'hotmail.com';
        if (/^(me|^icould|^mac)\.com/.test(domain))
            return 'me.com';
        return domain;
    };
    const emailSplit = email.split('@');
    if (emailSplit.length !== 2)
        return null;
    const domain = yahoo(emailSplit[1].toLowerCase());
    const ret = {
        imap: 'imap.' + domain,
        smtp: 'smtp.' + domain,
        SmtpPort: [465, 587, 994],
        ImapPort: 993,
        imapSsl: true,
        smtpSsl: true,
        haveAppPassword: false,
        ApplicationPasswordInformationUrl: ['']
    };
    switch (domain) {
        //		yahoo domain have two different 
        //		the yahoo.co.jp is different other yahoo.*
        case 'yahoo.co.jp': {
            ret.imap = 'imap.mail.yahoo.co.jp';
            ret.smtp = 'smtp.mail.yahoo.co.jp';
            break;
        }
        //			gmail
        case 'google.com':
        case 'googlemail.com':
        case 'gmail': {
            ret.haveAppPassword = true;
            ret.ApplicationPasswordInformationUrl = [
                'https://support.google.com/accounts/answer/185833?hl=zh-Hans',
                'https://support.google.com/accounts/answer/185833?hl=ja',
                'https://support.google.com/accounts/answer/185833?hl=en'
            ];
            break;
        }
        case 'gandi.net': {
            ret.imap = ret.smtp = 'mail.gandi.net';
            break;
        }
        //				yahoo.com
        case 'rocketmail.com':
        case 'y7mail.com':
        case 'ymail.com':
        case 'yahoo.com': {
            ret.imap = 'imap.mail.yahoo.com';
            ret.smtp = (/^bizmail.yahoo.com$/.test(emailSplit[1]))
                ? 'smtp.bizmail.yahoo.com'
                : 'smtp.mail.yahoo.com';
            ret.haveAppPassword = true;
            ret.ApplicationPasswordInformationUrl = [
                'https://help.yahoo.com/kb/SLN15241.html',
                'https://help.yahoo.com/kb/SLN15241.html',
                'https://help.yahoo.com/kb/SLN15241.html'
            ];
            break;
        }
        case 'mail.ee': {
            ret.smtp = 'mail.ee';
            ret.imap = 'mail.inbox.ee';
            break;
        }
        //		gmx.com
        case 'gmx.co.uk':
        case 'gmx.de':
        case 'gmx.us':
        case 'gmx.com': {
            ret.smtp = 'mail.gmx.com';
            ret.imap = 'imap.gmx.com';
            break;
        }
        //		aim.com
        case 'aim.com': {
            ret.imap = 'imap.aol.com';
            break;
        }
        //	outlook.com
        case 'windowslive.com':
        case 'hotmail.com':
        case 'outlook.com': {
            ret.imap = 'imap-mail.outlook.com';
            ret.smtp = 'smtp-mail.outlook.com';
            break;
        }
        //			apple mail
        case 'icloud.com':
        case 'mac.com':
        case 'me.com': {
            ret.imap = 'imap.mail.me.com';
            ret.smtp = 'smtp.mail.me.com';
            break;
        }
        //			163.com
        case '126.com':
        case '163.com': {
            ret.imap = 'appleimap.' + domain;
            ret.smtp = 'applesmtp.' + domain;
            break;
        }
        case 'sina.com':
        case 'yeah.net': {
            ret.smtpSsl = false;
            break;
        }
    }
    return ret;
};
class keyPairSign {
    constructor(exit) {
        this.exit = exit;
        this.signError = ko.observable(false);
        this.conformButtom = ko.observable(false);
        this.requestActivEmailrunning = ko.observable(false);
        this.showSentActivEmail = ko.observable(-1);
        this.conformText = ko.observable('');
        this.conformTextError = ko.observable(false);
        this.requestError = ko.observable(-1);
        this.conformTextErrorNumber = ko.observable(-1);
        this.activeing = ko.observable(false);
        this.showRequestActivEmailButtonError = ko.observable(false);
        const self = this;
        this.conformText.subscribe(function (newValue) {
            if (!newValue || !newValue.length) {
                self.conformButtom(false);
            }
            else {
                self.conformButtom(true);
            }
        });
    }
    checkActiveEmailSubmit() {
        const self = this;
        this.conformTextError(false);
        this.activeing(true);
        let text = this.conformText();
        const showFromatError = (err) => {
            self.activeing(false);
            self.conformTextErrorNumber(_view.connectInformationMessage.getErrorIndex(err));
            self.conformTextError(true);
            return $('.activating.element1').popup({
                on: 'click',
                onHidden: function () {
                    self.conformTextError(false);
                }
            });
        };
        if (!text || !text.length || !/^-+BEGIN PGP MESSAGE-+\n/.test(text)) {
            return showFromatError('PgpMessageFormatError');
        }
        //		support Outlook mail
        /*
        if ( / /.test ( text )) {
            text = text.replace ( / PGP MESSAGE/g, '__PGP__MESSAGE').replace (/ /g, '\r\n').replace (/__/g, ' ' )
            text = text.replace ( / MESSAGE-----/,' MESSAGE-----\r\n' )
        }
        /** */
        return _view.keyPairCalss.decryptMessage(text, (err, obj) => {
            if (err) {
                return showFromatError('PgpDecryptError');
            }
            const com = {
                command: 'activePassword',
                Args: [obj],
                error: null,
                subCom: null
            };
            return _view.keyPairCalss.emitRequest(com, (err, com) => {
                if (err) {
                    return showFromatError(err);
                }
                if (com) {
                    if (com.error) {
                        return showFromatError(com.error);
                    }
                    const keyPair = _view.localServerConfig().keypair;
                    keyPair.verified = true;
                    keyPair.publicKey = Buffer.from(com.Args[0], 'base64').toString();
                    _view.keyPair(keyPair);
                    _view.sectionLogin(false);
                    self.exit();
                }
            });
        });
        /*
        return _view.connectInformationMessage.sockEmit ( 'checkActiveEmailSubmit', text, function ( err, req: QTGateAPIRequestCommand ) {
            self.activeing ( false )
            if ( err !== null && err > -1 || req && req.error != null && req.error > -1 ) {
                self.conformTextErrorNumber ( err !== null && err > -1 ? err : req.error )
                self.conformTextError ( true )
                
            }
            if (!req ) {
                const config =  _view.localServerConfig()
                config.keypair.verified = true
                _view.localServerConfig ( config )
                _view.keyPair ( config.keypair )
                _view.sectionLogin ( false )
                self.exit ()
            }
            
        })
        */
    }
    clearError() {
        _view.connectInformationMessage.hideMessage();
        this.showRequestActivEmailButtonError(false);
    }
    requestActivEmail() {
        const self = this;
        this.requestActivEmailrunning(true);
        const com = {
            command: 'requestActivEmail',
            Args: [],
            error: null,
            subCom: null
        };
        const errorProcess = (err) => {
            this.requestActivEmailrunning(false);
            this.showRequestActivEmailButtonError(true);
            _view.connectInformationMessage.showErrorMessage(err);
        };
        _view.keyPairCalss.emitRequest(com, (err, com) => {
            if (err) {
                return errorProcess(err);
            }
            if (!com) {
                return;
            }
            if (com.error) {
                return errorProcess(err);
            }
            if (com.Args[0] && com.Args[0].length) {
                return _view.connectInformationMessage.sockEmit('checkActiveEmailSubmit', com.Args[0], () => {
                    const config = _view.localServerConfig();
                    config.keypair.verified = true;
                    _view.keyPair(config.keypair);
                    _view.sectionLogin(false);
                    localStorage.setItem("config", JSON.stringify(config));
                    self.exit();
                });
            }
            self.conformButtom(false);
            self.showSentActivEmail(1);
            const u = self.showSentActivEmail();
        });
        /*
        return _view.connectInformationMessage.sockEmit ( 'requestActivEmail', function ( err ) {
            self.requestActivEmailrunning ( false )
            if ( err !== null && err > -1 ) {
                return self.requestError ( err )
            }
            self.conformButtom ( false ),[h]
            self.showSentActivEmail (1)
            const u = self.showSentActivEmail()
        })
        */
    }
}
class imapForm {
    constructor(account, imapData, exit) {
        this.account = account;
        this.exit = exit;
        this.emailAddress = ko.observable('');
        this.password = ko.observable('');
        this.emailAddressShowError = ko.observable(false);
        this.passwordShowError = ko.observable(false);
        this.EmailAddressErrorType = ko.observable(0);
        this.showForm = ko.observable(true);
        this.checkProcessing = ko.observable(false);
        this.checkImapError = ko.observable(-1);
        this.showCheckProcess = ko.observable(false);
        this.checkImapStep = ko.observable(0);
        const self = this;
        if (imapData) {
            this.emailAddress(imapData.imapUserName);
            this.password(imapData.imapUserPassword);
        }
        this.emailAddress.subscribe(function (newValue) {
            return self.checkEmailAddress(newValue);
        });
        this.password.subscribe(function (newValue) {
            return self.clearError();
        });
    }
    clearError() {
        this.emailAddressShowError(false);
        this.EmailAddressErrorType(0);
        this.passwordShowError(false);
    }
    errorProcess(err) {
        //		Invalid login
        if (/Authentication|login/i.test(err)) {
            return this.checkImapError(1);
        }
        //		Cannot connect to email server!
        if (/ENOTFOUND/i.test(err)) {
            return this.checkImapError(0);
        }
        //		https://github.com/KloakIT/Kloak_platform/issues/2
        if (/certificate/i.test(err)) {
            return this.checkImapError(0);
        }
        this.checkImapError(5);
    }
    checkImapSetup() {
        let self = this;
        this.checkProcessing(true);
        this.checkImapStep(0);
        const imapTest = function (err) {
            if (err && typeof err === "string" || err !== null && err > -1) {
                return errorProcess(err);
            }
            self.checkImapStep(5);
        };
        const smtpTest = function (err) {
            if (err && typeof err === "string" || err !== null && err > -1) {
                return errorProcess(err);
            }
            self.checkImapStep(2);
        };
        const imapTestFinish = function (err, IinputData) {
            removeAllListen();
            if (err) {
                return errorProcess(err);
            }
            _view.keyPairCalss.decrypt_withLocalServerKey(IinputData, (err, data) => {
                if (err) {
                    return errorProcess(err);
                }
                return self.exit(data);
            });
        };
        const removeAllListen = function () {
            _view.connectInformationMessage.socketIo.removeEventListener('smtpTest', smtpTest);
            _view.connectInformationMessage.socketIo.removeEventListener('imapTest', imapTest);
            _view.connectInformationMessage.socketIo.removeEventListener('imapTestFinish', imapTestFinish);
        };
        const errorProcess = function (err) {
            removeAllListen();
            if (typeof err === "number") {
                return self.checkImapError(err);
            }
            return self.errorProcess(err);
        };
        _view.connectInformationMessage.socketIo.on('smtpTest', smtpTest);
        _view.connectInformationMessage.socketIo.on('imapTest', imapTest);
        _view.connectInformationMessage.socketIo.on('imapTestFinish', imapTestFinish);
        const imapServer = getImapSmtpHost(self.emailAddress());
        const imapConnectData = {
            email: self.account,
            account: self.account,
            smtpServer: imapServer.smtp,
            smtpUserName: self.emailAddress(),
            smtpPortNumber: imapServer.SmtpPort,
            smtpSsl: imapServer.smtpSsl,
            smtpIgnoreCertificate: false,
            smtpUserPassword: self.password(),
            imapServer: imapServer.imap,
            imapPortNumber: imapServer.ImapPort,
            imapSsl: imapServer.imapSsl,
            imapUserName: self.emailAddress(),
            imapIgnoreCertificate: false,
            imapUserPassword: self.password(),
            timeZoneOffset: new Date().getTimezoneOffset(),
            language: _view.tLang(),
            imapTestResult: null,
            clientFolder: uuid_generate(),
            serverFolder: uuid_generate(),
            randomPassword: uuid_generate(),
            uuid: uuid_generate(),
            confirmRisk: false,
            clientIpAddress: null,
            ciphers: null,
            sendToQTGate: false
        };
        _view.keyPairCalss.emitLocalCommand('checkImap', imapConnectData, err => {
        });
    }
    checkEmailAddress(email) {
        this.clearError();
        if (checkEmail(email).length) {
            this.EmailAddressErrorType(0);
            this.emailAddressShowError(true);
            return initPopupArea();
        }
        const imapServer = getImapSmtpHost(email);
        if (!availableImapServer.test(imapServer.imap)) {
            this.EmailAddressErrorType(2);
            this.emailAddressShowError(true);
            return initPopupArea();
        }
    }
    imapAccountGoCheckClick() {
        const self = this;
        this.checkEmailAddress(this.emailAddress());
        if (this.emailAddressShowError() || !this.password().length) {
            return;
        }
        this.showForm(false);
        this.showCheckProcess(true);
        this.checkImapError(-1);
        return this.checkImapSetup();
    }
    returnImapSetup() {
        this.showForm(true);
        this.showCheckProcess(false);
        this.checkImapError(-1);
    }
}
