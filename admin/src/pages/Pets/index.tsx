import { useEffect, useState } from 'react';
import { Table, Tag, Typography, Select, Space } from 'antd';
import { petsApi } from '../../services/api';

const { Title } = Typography;

const TYPE_MAP: Record<string, string> = { '猫咪': '🐱', '狗狗': '🐶', '其他': '🐾' };

export default function Pets() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const fetchPets = async (page = 1, size = 20, type = '') => {
    setLoading(true);
    try {
      const res: any = await petsApi.list({ page, size, type: type || undefined });
      setPets(res.data || []);
      setPagination((prev) => ({ ...prev, current: page, total: res.pagination?.total || 0 }));
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchPets(); }, []);

  const columns = [
    {
      title: '头像', dataIndex: 'emoji', key: 'emoji',
      render: (v: string) => <span style={{ fontSize: 28 }}>{v || '🐾'}</span>,
      width: 70,
    },
    { title: '名字', dataIndex: 'name', key: 'name' },
    { title: '品种', dataIndex: 'breed', key: 'breed', render: (v: string) => v || '-' },
    {
      title: '类型', dataIndex: 'type', key: 'type',
      render: (v: string) => <Tag>{TYPE_MAP[v] || '🐾'} {v}</Tag>,
    },
    {
      title: '性别', dataIndex: 'gender', key: 'gender',
      render: (v: string) => <Tag color={v === '男孩' ? 'blue' : 'pink'}>{v}</Tag>,
    },
    { title: '体重 (kg)', dataIndex: 'weight', key: 'weight' },
    {
      title: '伴龄 (天)', key: 'days',
      render: (_: any, r: any) => {
        if (!r.meetDate) return '-';
        return Math.floor((Date.now() - new Date(r.meetDate).getTime()) / 86400000) + 1;
      },
    },
  ];

  return (
    <div>
      <Title level={4}>宠物管理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="筛选类型"
          allowClear
          value={typeFilter || undefined}
          onChange={(v) => { setTypeFilter(v || ''); fetchPets(1, 20, v || ''); }}
          options={[
            { label: '🐶 狗狗', value: '狗狗' },
            { label: '🐱 猫咪', value: '猫咪' },
            { label: '🐾 其他', value: '其他' },
          ]}
          style={{ width: 160 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={pets}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 只宠物`,
          onChange: (page, size) => fetchPets(page, size, typeFilter),
        }}
      />
    </div>
  );
}
