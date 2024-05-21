import React, { useEffect, useState, useRef } from 'react';
import { useIntl } from 'react-intl';
import { decryptUploadFiles } from 'services/filesService.js';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin, Radio, Input } from 'antd';
import Emitter from 'utils/eventBus';
import { t } from 'utils/text.js';
import CommonModal from './CommonModal';
import isIPFS from 'is-ipfs';


const options = [
    { label: 'decrypt_file_with_host', value: 'host' },
    { label: 'decrypt_file_with_password', value: 'password' },
];
let inputMaxLength = 100;

export default function EncryptFileModal({ color }) {
    const intl = useIntl();
    const [showModal, setShowModal] = useState(false);
    const [cId, setCId] = useState('');
    const [hostId, setHostId] = useState('');
    const [validateMsg, setValidateMsg] = useState('');
    const [validateHostIdMsg, setValidateHostIdMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [decryptType, setDecryptType] = useState('host');
    const [password, setPassword] = useState('');
    const [validateKeyMsg, setValidateKeyMsg] = useState('');
    const inputRef = useRef(null);
    const inputHostIdRef = useRef(null);
    const inputKeyRef = useRef(null);

    useEffect(() => {
        const set = async function (params) {
            console.log('openDecryptFileModal event has occured');
            setCId('');
            setValidateMsg('');
            setValidateHostIdMsg('');
            setLoading(false);
            openModal();
        };
        Emitter.on('openDecryptFileModal', set);
        return () => {
            Emitter.removeListener('openDecryptFileModal');
            window.body.style.overflow = '';
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openModal = () => {
        setShowModal(true);
        window.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setCId('');
        setValidateMsg('');
        setValidateHostIdMsg('');
        setLoading(false);
        setShowModal(false);
        window.body.style.overflow = '';
    };

    const validateHostId = val => {
        // let reg = /^[A-Za-z0-9]+$/;
        let res = isIPFS.cid(val)
        console.log(val,res,'-----')
        if (!val || res) {
            setValidateMsg('');
            return true;
        }
        // if (!reg.test(val)) {
        //     setValidateMsg(t('decrypt_file_cid_validate'));
        // }
        if (!res) {
            setValidateMsg(t('decrypt_file_cid_validate'));
        }
        return false;
    };

    const checkPassword = () => {
        const reg = /^[0-9A-Za-z]{6,20}$/g;
        if (!password || reg.test(password)) {
            setValidateKeyMsg('');
            return true;
        }
        if (!reg.test(password)) {
            setValidateKeyMsg(t('validate_decryptkey'));
            return false;
        }
        setValidateKeyMsg('');
        return true;
    };
    const validateDecryptHostId = (val)=>{
        let reg = /^[A-Za-z0-9]+$/;
        if (!val || reg.test(val)) {
            setValidateHostIdMsg('');
            return true;
        }
        if (!reg.test(val)) {
            setValidateHostIdMsg(t('decrypt_file_hostId_validate'));
            return false;
        }
        return true;
    }

    const cidChange = vals => {
        const val = inputRef.current.value;
        setCId(val);
        validateHostId(val);
    };

    const hostIdChange = vals => {
        const val = inputHostIdRef.current.value;
        setHostId(val);
        validateDecryptHostId(val);
    };

    const passwordChange = vals => {
        const val = inputKeyRef.current.value;
        setPassword(val);
        checkPassword(val);
    };

    const DecryptFile = async () => {

        if(!validateDecryptHostId(hostId)){
            return;
        }
        if (cId && !validateHostId(cId)) {
            setValidateMsg(t('decrypt_file_cid_validate'));
            return;
        }

        if (!cId) {
            setValidateMsg(t('decrypt_file_cid_null_validate'));
            return;
        }


        if (decryptType === 'password' && password ==='') {
            setValidateKeyMsg(t('validate_decryptkey_null'));
            return;
        }

        if (decryptType === 'password' && !checkPassword()) {
            return;
        }

        setLoading(true);
        try {
            await decryptUploadFiles(cId,hostId,password);
            setLoading(false);
            Emitter.emit('showMessageAlert', {
                message: 'decrypt_download_success',
                status: 'success',
                type: 'frontEnd',
            });
        } catch (e) {
            Emitter.emit('showMessageAlert', { message: e.Message, status: 'error' });
        }
        closeModal();
    };
    const onChange = e => {
        setDecryptType(e.target.value);
    };
    return (
        <CommonModal visible={showModal} onCancel={closeModal}>
            <div className="common-modal-wrapper theme-bg">
                <main className="flex flex-col justify-center items-center theme-bg theme-text-main">
                    <div className="font-semibold  text-xl"> {t('decrypt_upload_file')} </div>
                    <div className="text-xs font-medium mb-6 theme-text-sub-info">
                        {t('decrypt_upload_file_desc')}
                    </div>

                    <div className="font-semibold  w-full mb-3">
                        <Radio.Group
                            onChange={onChange}
                            optionType="button"
                            buttonStyle="solid"
                            className="flex justify-between w-full encrypt_upload_select"
                            value={decryptType}>
                            {options.map(v => {
                                return (
                                    <Radio value={v.value}>
                                        <div className=" w-full font-semibold mb-3">
                                            <p>{t(`${v.label}`)}</p>
                                        </div>
                                    </Radio>
                                );
                            })}
                        </Radio.Group>
                    </div>

                    <div className="flex justify-between w-full font-semibold">
                        <div>{t('dncrypt_file_hostid')}</div>
                    </div>
                    <div className="flex justify-between w-full text-xs font-medium  theme-text-sub-info mb-3">
                        <div>{t('dncrypt_file_hostid_desc')}</div>
                    </div>
                    <input
                        id="file-input"
                        type="input"
                        className="w-full h-3 common-input  theme-bg theme-border-color"
                        single="true"
                        // placeholder={intl.formatMessage({ id: 'decrypt_input_cid_placeholder' })}
                        maxLength={inputMaxLength}
                        ref={inputHostIdRef}
                        onChange={hostIdChange}
                        value={hostId}
                    />
                    <div className="flex justify-between  w-full  mb-4">
                        <span className="theme-text-error text-xs pt-1">{validateHostIdMsg}</span>
                    </div>

                    <div className="flex justify-between w-full font-semibold mb-3">
                        <div>{t('dncrypt_file_cid')}</div>
                    </div>
                    <input
                        id="file-input"
                        type="input"
                        className="w-full h-3 common-input  theme-bg theme-border-color"
                        single="true"
                        placeholder={intl.formatMessage({ id: 'decrypt_input_cid_placeholder' })}
                        maxLength={inputMaxLength}
                        ref={inputRef}
                        onChange={cidChange}
                        value={cId}
                    />
                    <div className="flex justify-between  w-full  mb-4">
                        <span className="theme-text-error text-xs pt-1">{validateMsg}</span>
                        {
                            // <span>
                            //     {cId.length || 0}/{inputMaxLength}
                            // </span>
                        }
                    </div>

                    <div className={decryptType === 'host' ? 'w-full hidden' : 'w-full '}>
                        <div className="flex justify-between w-full font-semibold mb-3">
                            {t('decrypt_file_password')}
                        </div>
                        <div>
                            <input
                                placeholder={intl.formatMessage({ id: 'set_decrypt_key_placeholder' })}
                                className="common-input random_key"
                                maxLength={inputMaxLength}
                                ref={inputKeyRef}
                                onChange={passwordChange}
                                value={password}
                            />
                            <div className="flex justify-between text-xs  w-full  mb-4">
                                <span className="theme-text-error">{validateKeyMsg}</span>
                                {
                                    // <span>
                                    //     {hostId.length || 0}/{inputMaxLength}
                                    // </span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="mt-2">
                        <button
                            className="ml-2 common-btn theme-fill-gray text-gray-900 mr-6"
                            onClick={closeModal}>
                            {t('cancel_encrypt_file_btn')}
                        </button>

                        <div className="ml-2 inline-block">
                            <Spin
                                spinning={loading}
                                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
                                <button
                                    type="primary"
                                    className="common-btn theme-common-btn"
                                    onClick={DecryptFile}>
                                    {t('decrypt_file_btn')}
                                </button>
                            </Spin>
                        </div>
                    </div>
                </main>
            </div>
        </CommonModal>
    );
}
