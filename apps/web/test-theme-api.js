/**
 * 测试主题切换 API
 */

async function testThemeAPI() {
  const baseUrl = 'http://localhost:3000/api/admin/themes';
  
  console.log('🧪 开始测试主题 API...\n');
  
  // 测试 1: 获取主题列表
  console.log('📋 测试 1: 获取主题列表');
  try {
    const response = await fetch(baseUrl);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ 成功获取主题列表`);
      console.log(`   主题数量：${data.count}`);
      data.themes.forEach((theme) => {
        console.log(`   - ${theme.name} (${theme.id}) ${theme.isActive ? '✓ 激活' : ''}`);
      });
    } else {
      console.log(`❌ 失败：${data.error}`);
    }
  } catch (error) {
    console.log(`❌ 错误：${error.message}`);
  }
  
  console.log('\n');
  
  // 测试 2: 激活 Cyber 主题
  console.log('🎨 测试 2: 激活 Cyber 主题');
  try {
    const response = await fetch(`${baseUrl}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ themeId: 'cyber' }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Cyber 主题激活成功`);
      console.log(`   主题名称：${data.theme.name}`);
    } else {
      console.log(`❌ 失败：${data.error}`);
    }
  } catch (error) {
    console.log(`❌ 错误：${error.message}`);
  }
  
  console.log('\n');
  
  // 测试 3: 再次获取主题列表，验证激活状态
  console.log('📋 测试 3: 验证激活状态');
  try {
    const response = await fetch(baseUrl);
    const data = await response.json();
    
    if (data.success) {
      const activeTheme = data.themes.find((t) => t.isActive);
      if (activeTheme) {
        console.log(`✅ 当前激活主题：${activeTheme.name} (${activeTheme.id})`);
      } else {
        console.log(`⚠️  没有激活的主题`);
      }
    }
  } catch (error) {
    console.log(`❌ 错误：${error.message}`);
  }
  
  console.log('\n');
  
  // 测试 4: 切换回 Inkwell 主题
  console.log('🎨 测试 4: 切换回 Inkwell 主题');
  try {
    const response = await fetch(`${baseUrl}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ themeId: 'inkwell' }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Inkwell 主题激活成功`);
    } else {
      console.log(`❌ 失败：${data.error}`);
    }
  } catch (error) {
    console.log(`❌ 错误：${error.message}`);
  }
  
  console.log('\n✅ 测试完成！\n');
}

// 运行测试
testThemeAPI().catch(console.error);
