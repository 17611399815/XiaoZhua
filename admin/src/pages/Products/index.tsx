import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Input, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../services/api';

const { Title } = Typography;

const CAT_MAP: Record<string, string> = {
  food: '主粮', snack: '零食', supplies: '用品', toy: '玩具', medicine: '药品', clothing: '服饰',
};

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const navigate = useNavigate();

  const fetchProducts = async (page = 1, size = 20, search = '') => {
    setLoading(true);
    try {
      const res: any = await productsApi.list({ page, size, keyword: search || undefined });
      setProducts(res.data || []);
      setPagination((prev) => ({ ...prev, current: page, total: res.pagination?.total || 0 }));
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await productsApi.remove(id);
      message.success('已删除');
      fetchProducts();
    } catch (err: any) { message.error(err.message); }
  };

  const columns = [
    { title: '图标', dataIndex: 'emoji', key: 'emoji', render: (v: string) => <span style={{ fontSize: 24 }}>{v || '📦'}</span>, width: 60 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '分类', dataIndex: 'category', key: 'category',
      render: (v: string) => <Tag>{CAT_MAP[v] || v}</Tag>,
    },
    {
      title: '价格', dataIndex: 'price', key: 'price',
      render: (v: number) => `¥${Number(v).toFixed(2)}`,
    },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    {
      title: '状态', dataIndex: 'is_on_sale', key: 'is_on_sale',
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? '在售' : '下架'}</Tag>,
    },
    {
      title: '操作', key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/products/${record.id}/edit`)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此商品？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>商品管理</Title>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder="搜索商品名称"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => fetchProducts(1, 20, keyword)}
            style={{ width: 240 }}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/new')}>
          新增商品
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 件商品`,
          onChange: (page, size) => fetchProducts(page, size, keyword),
        }}
      />
    </div>
  );
}
