import { useEffect, useState } from 'react';
import { Table, Input, Space, Tag, Typography, Button } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../../services/api';

const { Title } = Typography;

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const navigate = useNavigate();

  const fetchUsers = async (page = 1, size = 20, search = '') => {
    setLoading(true);
    try {
      const res: any = await usersApi.list({ page, size, keyword: search });
      setUsers(res.data || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: res.pagination?.total || 0,
      }));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname', render: (v: string) => v || '-' },
    {
      title: '角色', dataIndex: 'role', key: 'role',
      render: (v: string) => <Tag color={v === 'admin' ? 'orange' : 'blue'}>{v === 'admin' ? '管理员' : '用户'}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={v === 'active' ? 'green' : 'red'}>{v === 'active' ? '正常' : '已禁用'}</Tag>,
    },
    {
      title: '注册时间', dataIndex: 'created_at', key: 'created_at',
      render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: '操作', key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/users/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>用户管理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索手机号"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={() => fetchUsers(1, 20, keyword)}
          style={{ width: 240 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, size) => fetchUsers(page, size, keyword),
        }}
      />
    </div>
  );
}
