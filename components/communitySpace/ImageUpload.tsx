import React, { useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};

const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
};

export default function ImageUpload({...props}) {
    const { loading, setLoading, imageUrl, setImageUrl, name, action } = props;
    const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj as RcFile, (url) => {
                setLoading(false);
                setImageUrl(url);
            });
        }
    };
    if (name == "background")
        return (
            <Upload
                name={name}
                listType="picture-card"
                className={`${name}-uploader`}
                showUploadList={false}
                action={action}
                beforeUpload={beforeUpload}
                onChange={handleChange}
            >
                <img src={imageUrl} alt={name} style={{ height: '100%' }} />
                <div style={{ position: "absolute" }}>
                    {loading ? <LoadingOutlined />
                        :
                        <img src="/img/new_image.png" alt="new image icon" style={{ width: 50, height: 50 }} />}

                </div>
            </Upload>
        );
    return (
        <Upload
            name={name}
            listType="picture-card"
            className={`${name}-uploader`}
            showUploadList={false}
            action={action}
            beforeUpload={beforeUpload}
            onChange={handleChange}
        >
            <img src={imageUrl} alt={name} style={{ height: '100%' }} />
            <div style={{ position: "absolute" }}>
                {loading && <LoadingOutlined />}

            </div>
        </Upload>
    );
};
