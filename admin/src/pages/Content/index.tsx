import { Card, Typography, List, Tag } from 'antd';

const { Title } = Typography;

export default function Content() {
  return (
    <div>
      <Title level={4}>内容管理</Title>
      <Card title="首页活动横幅" style={{ borderRadius: 12, marginBottom: 16 }}>
        <List
          dataSource={[
            { id: 1, title: '618 宠物节', status: 'active', date: '2026-06-01 ~ 2026-06-18' },
            { id: 2, title: '新用户专享优惠', status: 'active', date: '长期有效' },
          ]}
          renderItem={(item: any) => (
            <List.Item
              extra={<Tag color={item.status === 'active' ? 'green' : 'default'}>{item.status === 'active' ? '生效中' : '已下线'}</Tag>}
            >
              <List.Item.Meta title={item.title} description={item.date} />
            </List.Item>
          )}
        />
      </Card>

      <Card title="AI 建议库" style={{ borderRadius: 12, marginBottom: 16 }}>
        <List
          dataSource={[
            '我的狗狗最近食欲不振怎么办？',
            '猫咪掉毛严重有什么好办法？',
            '宠物多久洗一次澡比较合适？',
            '如何给宠物选择合适的狗粮？',
            '宠物疫苗需要每年都打吗？',
          ]}
          renderItem={(item: string) => (
            <List.Item>
              <Tag color="purple">💡</Tag> {item}
            </List.Item>
          )}
        />
      </Card>

      <Card title="公告管理" style={{ borderRadius: 12 }}>
        <List
          dataSource={[
            { title: '系统升级通知', date: '2026-07-01', content: '小爪将于7月5日凌晨进行系统升级，届时暂停服务约2小时。' },
          ]}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta title={item.title} description={`${item.date} · ${item.content}`} />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
