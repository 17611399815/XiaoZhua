import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, List, Tag, Typography, Button, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { usersApi } from '../../services/api';

const { Title } = Typography;

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      usersApi.detail(id).then((res: any) => setUser(res.data)).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!user) return <div>用户不存在</div>;

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/users')} style={{ marginBottom: 16 }}>
        返回列表
      </Button>
      <Title level={4}>用户详情</Title>
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="手机号">{user.phone}</Descriptions.Item>
          <Descriptions.Item label="昵称">{user.nickname || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color={user.role === 'admin' ? 'orange' : 'blue'}>{user.role}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={user.status === 'active' ? 'green' : 'red'}>{user.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {new Date(user.created_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Title level={5}>宠物列表</Title>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={user.pets || []}
        renderItem={(pet: any) => (
          <List.Item>
            <Card
              style={{ borderRadius: 12 }}
              hoverable
            >
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 40 }}>{pet.emoji || '🐾'}</span>
              </div>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="名字">{pet.name}</Descriptions.Item>
                <Descriptions.Item label="类型">{pet.type}</Descriptions.Item>
                <Descriptions.Item label="品种">{pet.breed || '-'}</Descriptions.Item>
                <Descriptions.Item label="体重">{pet.weight} kg</Descriptions.Item>
              </Descriptions>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}
