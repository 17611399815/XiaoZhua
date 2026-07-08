import { useState } from 'react';
import { Card, Typography, Descriptions, Button, message, Upload, Image } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import appLogoImg from '../../assets/app-logo.jpg';

const { Title } = Typography;

export default function Settings() {
  const [appLogo, setAppLogo] = useState<string>(appLogoImg);

  return (
    <div>
      <Title level={4}>系统设置</Title>

      {/* ── App 图片设置 ── */}
      <Card title="🐾 App 图片设置" style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* App Logo */}
          <div>
            <span style={{ fontWeight: 700, color: '#8C6239', display: 'block', marginBottom: 8 }}>App 首页 Logo</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 16, border: '2px solid #FFE7D1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', background: '#FFF'
              }}>
                <img src={appLogo} alt="App Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const reader = new FileReader();
                    reader.onload = () => { setAppLogo(reader.result as string); message.success('Logo 已更新！刷新手机端模拟器即可查看'); };
                    reader.readAsDataURL(file);
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />} style={{ borderRadius: 8 }}>上传新 Logo</Button>
                </Upload>
                <Button icon={<DeleteOutlined />} danger onClick={() => { setAppLogo(appLogoImg); message.info('已恢复默认 Logo'); }} style={{ borderRadius: 8 }}>
                  恢复默认
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="管理员账号" style={{ borderRadius: 12, marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="当前账号">admin</Descriptions.Item>
          <Descriptions.Item label="角色">超级管理员</Descriptions.Item>
        </Descriptions>
        <Button
          type="primary"
          danger
          onClick={() => message.info('密码修改功能开发中')}
          style={{ marginTop: 12, borderRadius: 10 }}
        >
          修改密码
        </Button>
      </Card>

      <Card title="系统参数" style={{ borderRadius: 12, marginBottom: 16 }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="API 版本">v1.0.0</Descriptions.Item>
          <Descriptions.Item label="数据库">PostgreSQL 16</Descriptions.Item>
          <Descriptions.Item label="缓存">Redis 7</Descriptions.Item>
          <Descriptions.Item label="文件存储">MinIO</Descriptions.Item>
          <Descriptions.Item label="运行环境">{import.meta.env.MODE}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="API 配置" style={{ borderRadius: 12 }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="SMS 服务商">阿里云 SMS</Descriptions.Item>
          <Descriptions.Item label="AI 模型">DeepSeek (deepseek-chat)</Descriptions.Item>
          <Descriptions.Item label="推送服务">Firebase + 华为 Push Kit</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
