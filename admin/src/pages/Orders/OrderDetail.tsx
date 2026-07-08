import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Select, message, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ordersApi } from '../../services/api';

const { Title } = Typography;

const STATUS_OPTIONS = [
  { label: '待支付', value: 'pending' },
  { label: '已支付', value: 'paid' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      ordersApi.detail(id).then((res: any) => setOrder(res.data)).finally(() => setLoading(false));
    }
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await ordersApi.updateStatus(id!, status);
      message.success('状态已更新');
      setOrder((prev: any) => ({ ...prev, status }));
    } catch (err: any) { message.error(err.message); }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!order) return <div>订单不存在</div>;

  const itemColumns = [
    { title: '商品', dataIndex: 'product', key: 'product', render: (v: any) => v?.name || '-' },
    { title: '单价', dataIndex: 'price', key: 'price', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '小计', key: 'subtotal',
      render: (_: any, r: any) => `¥${(Number(r.price) * r.quantity).toFixed(2)}`,
    },
  ];

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')} style={{ marginBottom: 16 }}>
        返回列表
      </Button>
      <Title level={4}>订单详情</Title>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="订单号">{order.id?.slice(0, 8)?.toUpperCase()}</Descriptions.Item>
          <Descriptions.Item label="用户">{order.user?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="总金额">¥{Number(order.total_amount).toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={order.status === 'completed' ? 'green' : order.status === 'cancelled' ? 'default' : 'orange'}>
              {STATUS_OPTIONS.find((o) => o.value === order.status)?.label || order.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(order.created_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(order.updated_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 16 }}>
          <span style={{ marginRight: 8, fontWeight: 600 }}>更新状态：</span>
          <Select
            value={order.status}
            options={STATUS_OPTIONS}
            onChange={updateStatus}
            style={{ width: 140 }}
          />
        </div>
      </Card>

      <Title level={5}>商品明细</Title>
      <Table
        columns={itemColumns}
        dataSource={order.items || []}
        rowKey="id"
        pagination={false}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2}>
              <strong>合计</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} colSpan={2}>
              <strong style={{ color: '#E8791A', fontSize: 16 }}>
                ¥{Number(order.total_amount).toFixed(2)}
              </strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  );
}
