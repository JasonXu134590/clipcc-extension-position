const { Extension, type, api } = require('clipcc-extension');

class CandyBucket {
    constructor(candy = 5, refresh = 20 * 1000) {
        this._currentCandy = candy;
        this._full = candy;
        setInterval(() => {
            if (this._currentCandy < this._full) {
                this._currentCandy++;
            }
        }, refresh);
    }

    get isEmpty() {
        if (this._currentCandy === 0) return true;
        else {
            this._currentCandy--;
            return false;
        }
    }
}

class PositionExtension extends Extension {

    onInit() {
        const { version } = api.getVmInstance().runtime;
        const isCommunity = version.startsWith('c');
        const bucket = new CandyBucket();
        let alerting = false;
        let userAllow = -1;
        let Userposition = {'lat':NaN,'lon':NaN};

        api.addCategory({
            categoryId: 'jasonxu.position.position',
            messageId: 'jasonxu.position.position.messageid',
            color: '#E98715'
        });

        api.addBlock({
            opcode: 'jasonxu.position.checkAble.opcode',
            type: type.BlockType.BOOLEAN,
            messageId: 'jasonxu.position.checkAble',
            categoryId: 'jasonxu.position.position',
            function: () => {
                if (navigator.geolocation) return true;
                else return false;
            }
        });

        api.addBlock({
            opcode: 'jasonxu.position.userAllow.opcode',
            type: type.BlockType.BOOLEAN,
            messageId: 'jasonxu.position.userAllow',
            categoryId: 'jasonxu.position.position',
            function: () => {
                if (userAllow == -1) return false;
                else return userAllow;
            }
        });

        api.addBlock({
            opcode: 'jasonxu.position.getAllow.opcode',
            type: type.BlockType.COMMAND,
            messageId: 'jasonxu.position.getAllow',
            categoryId: 'jasonxu.position.position',
            function: (args) => {
                if (userAllow != -1) return;
                if (window.clipAlert) {
                    if (alerting) return;
                    if (!bucket.isEmpty) {
                        userAllow = new Promise(resolve => {
                            alerting = true;
                            clipAlert("位置获取申请", "此项目正在申请获取您的位置，请确认您明白自己在做什么并仔细斟酌此项目的安全性。若您同意，即表示由此引发的任何后果均由您本人承担。若您的定位信息被项目过度使用或违规使用，您可以使用举报功能反馈给我们。申请理由："+args.REASON)
                                .then(result => {
                                    alerting = false;
                                    resolve(result);
                                });
                        });
                    }
                }
                if (!bucket.isEmpty) userAllow = confirm("此项目正在申请获取您的位置，请确认您明白自己在做什么并仔细斟酌此项目的安全性。若您同意，即表示由此引发的任何后果均由您本人承担。申请理由："+args.REASON);
            },
            param:{
                REASON:{
                    type: type.ParameterType.STRING,
                    default: '获取您当地的天气信息'
                }
            }
        });

        api.addBlock({
            opcode: 'jasonxu.position.geolocation.opcode',
            type: type.BlockType.COMMAND,
            messageId: 'jasonxu.position.geolocation',
            categoryId: 'jasonxu.position.position',
            function: () => {
                navigator.geolocation.getCurrentPosition(position =>{
                    Userposition = {'lat':position.coords.latitude,'lon':position.coords.longitude}
                });
            }
        });

        api.addBlock({
            opcode: 'jasonxu.position.getLat.opcode',
            type: type.BlockType.REPORTER,
            messageId: 'jasonxu.position.getLat',
            categoryId: 'jasonxu.position.position',
            function: () => {
                return Userposition.lat;
            }
        });

        api.addBlock({
            opcode: 'jasonxu.position.getLon.opcode',
            type: type.BlockType.REPORTER,
            messageId: 'jasonxu.position.getLon',
            categoryId: 'jasonxu.position.position',
            function: () => {
                return Userposition.lon;
            }
        });
    }

    onUninit() {
        api.removeCategory('jasonxu.position.position');
    }
}

module.exports = PositionExtension;
