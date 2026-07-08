import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button, Card, message, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { productsApi } from '../../services/api';

const { Title } = Typography;

const CATEGORIES = [
  { label: '🦴 主粮', value: 'food' },
  { label: '🍖 零食', value: 'snack' },
  { label: '🧴 用品', value: 'supplies' },
  { label: '🎾 玩具', value: 'toy' },
  { label: '💊 药品', value: 'medicine' },
  { label: '👔 服饰', value: 'clothing' },
];

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      if (isEdit) {
        await productsApi.update(id!, values);
        message.success('更新成功');
      } else {
        await productsApi.create(values);
        message.success('创建成功');
      }
      navigate('/products');
    } catch (err: any) {
      message.error(err.message);
    }
  };

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')} style={{ marginBottom: 16 }}>
        返回列表
      </Button>
      <Title level={4}>{isEdit ? '编辑商品' : '新增商品'}</Title>
      <Card style={{ borderRadius: 12, maxWidth: 640 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如：天然狗粮 5kg" />
          </Form.Item>
          <Form.Item name="emoji" label="图标 Emoji">
            <Input placeholder="例如：🦴" maxLength={10} />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select options={CATEGORIES} placeholder="选择分类" />
          </Form.Item>
          <Form.Item name="price" label="价格 (¥)" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} precision={2} style={{ width: '100%' }} placeholder="0.00" />
          </Form.Item>
          <Form.Item name="stock" label="库存数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item name="description" label="商品描述">
            <Input.TextArea rows={3} placeholder="商品详细描述" />
          </Form.Item>
          <Form.Item name="image_url" label="图片 URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" style={{ borderRadius: 12 }}>
              {isEdit ? '保存修改' : '创建商品'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
