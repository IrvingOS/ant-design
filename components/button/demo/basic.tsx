import { Button, Space } from 'antd';
import React from 'react';

const App: React.FC = () => (
  <Space wrap>
    <Button type="primary" loading>
      Primary Button
    </Button>
    <Button>Default Button</Button>
    <Button type="dashed">Dashed Button</Button>
    <Button type="text">Text Button</Button>
    <Button type="link">Link Button</Button>
    <Button type="link" href="https://blog.isopen.top">
      Link with href
    </Button>
    <Button type="primary" href="https://blog.isopen.top">
      Primary with href
    </Button>
  </Space>
);

export default App;
