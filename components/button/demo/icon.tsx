import { SearchOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import React from 'react';

const App: React.FC = () => (
  <Space direction="vertical">
    <Space wrap>
      <Tooltip title="search">
        <Button type="primary" shape="circle" icon={<SearchOutlined />} />
      </Tooltip>
      <Button type="primary" shape="circle">
        A
      </Button>
      {/* TODO 此时同时存在 loading 图标和 <SearchOutlined /> 图标，对 loading 的处理没有适配这种情况 */}
      <Button type="primary" loading>
        <SearchOutlined /> SearchWithButtonChild
      </Button>
      <Button type="primary" loading>
        <SearchOutlined /> 1
      </Button>
      <Tooltip title="search">
        <Button shape="circle" icon={<SearchOutlined />} />
      </Tooltip>
      <Button icon={<SearchOutlined />}>Search</Button>
    </Space>
    <Space wrap>
      <Tooltip title="search">
        <Button shape="circle" icon={<SearchOutlined />} />
      </Tooltip>
      <Button icon={<SearchOutlined />}>Search</Button>
      <Tooltip title="search">
        <Button type="dashed" shape="circle" icon={<SearchOutlined />} />
      </Tooltip>
      <Button type="dashed" icon={<SearchOutlined />}>
        Search
      </Button>
      <Button icon={<SearchOutlined />} href="https://www.google.com" />
    </Space>
  </Space>
);

export default App;
