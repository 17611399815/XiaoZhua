import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import {
  UserOutlined,
  GithubOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { dashboardApi } from '../../services/api';

const { Title } = Typography;

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    dashboardApi.getStats().then((res: any) => setStats(res.data || {})).catch(() => {});
  }, []);

  const cards = [
    { title: '总用户数', value: stats.totalUsers || 0, icon: <UserOutlined />, color: '#FFB23F' },
    { title: '总宠物数', value: stats.totalPets || 0, icon: <GithubOutlined />, color: '#FF7A70' },
    { title: '总订单数', value: stats.totalOrders || 0, icon: <ShoppingCartOutlined />, color: '#22B8A7' },
    { title: '总收入 (¥)', value: stats.totalRevenue || 0, icon: <DollarOutlined />, color: '#4D96FF' },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        仪表盘
      </Title>
      <Row gutter={[16, 16]}>
        {cards.map((card, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card
              hoverable
              style={{ borderRadius: 12 }}
            >
              <Statistic
                title={card.title}
                value={card.value}
                prefix={
                  <span
                    style={{
                      color: card.color,
                      fontSize: 28,
                      marginRight: 8,
                    }}
                  >
                    {card.icon}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="快速入口" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              {[
                { label: '用户管理', path: '/users' },
                { label: '宠物管理', path: '/pets' },
                { label: '商品管理', path: '/products' },
                { label: '订单管理', path: '/orders' },
                { label: '内容管理', path: '/content' },
                { label: '系统设置', path: '/settings' },
              ].map((item) => (
                <Col key={item.path}>
                  <a
                    href={item.path}
                    style={{
                      display: 'inline-block',
                      padding: '8px 20px',
                      background: '#FFF6DB',
                      borderRadius: 10,
                      color: '#E8791A',
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    {item.label} →
                  </a>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
