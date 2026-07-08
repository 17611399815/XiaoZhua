import { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import { ordersApi } from '../../services/api';

const { Title } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending: { color: 'orange', label: '待支付' },
  paid: { color: 'blue', label: '已支付' },
  shipped: { color: 'purple', label: '已发货' },
  completed: { color: 'green', label: '已完成' },
  cancelled: { color: 'default', label: '已取消' },
};

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const navigate = useNavigate();

  const fetchOrders = async (page = 1, size = 20, status = '') => {
    setLoading(true);
    try {
      const res: any = await ordersApi.list({ page, size, status: status || undefined });
      setOrders(res.data || []);
      setPagination((prev) => ({ ...prev, current: page, total: res.pagination?.total || 0 }));
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const columns = [
    {
      title: '订单号', dataIndex: 'id', key: 'id',
      render: (v: string) => v?.slice(0, 8)?.toUpperCase(),
      width: 100,
    },
    {
      title: '用户', dataIndex: 'user', key: 'user',
      render: (v: any) => v?.phone || '-',
    },
    {
      title: '金额', dataIndex: 'total_amount', key: 'total_amount',
      render: (v: number) => `¥${Number(v).toFixed(2)}`,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (v: string) => {
        const s = STATUS_MAP[v] || { color: 'default', label: v };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '时间', dataIndex: 'created_at', key: 'created_at',
      render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作', key: 'action',
      render: (_: any, record: any) => (
        <a onClick={() => navigate(`/orders/${record.id}`)}>
          <EyeOutlined /> 查看
        </a>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>订单管理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="筛选状态"
          allowClear
          value={statusFilter || undefined}
          onChange={(v) => { setStatusFilter(v || ''); fetchOrders(1, 20, v || ''); }}
          options={Object.entries(STATUS_MAP).map(([k, v]) => ({ label: v.label, value: k }))}
          style={{ width: 160 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 单`,
          onChange: (page, size) => fetchOrders(page, size, statusFilter),
        }}
      />
    </div>
  );
}
