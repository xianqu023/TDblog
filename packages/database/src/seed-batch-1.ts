import { prisma } from './index';

// 第一批3篇文章
const batch1Articles = [
  {
    slug: 'remote-work-productivity-tips',
    status: 'PUBLISHED',
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1521898284481-a5a3252a18c2?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: '远程工作效率提升指南',
        excerpt: '学习如何在远程工作环境中保持高效，平衡工作与生活。',
        content: `
          <h2>远程工作的兴起</h2>
          <p>远程工作已经成为新常态，越来越多的公司采用混合办公模式。根据最新的调查报告，超过60%的专业人士现在至少有一部分时间在家工作。这种工作方式带来了前所未有的灵活性，但也带来了独特的挑战。</p>
          
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop" alt="Remote Work" />
          
          <h2>打造高效的家庭办公环境</h2>
          <p>一个良好的工作环境是提高效率的基础。首先，你需要一个专门的工作空间，最好是一个可以关门的房间。这有助于在心理上区分工作和休息时间。</p>
          
          <h3>1.  ergonomic 家具投资</h3>
          <p>投资一把好的椅子和一张可调节的桌子。长时间坐着工作会对身体造成压力，正确的坐姿和支撑可以预防背部和颈部问题。</p>
          
          <h3>2. 良好的照明</h3>
          <p>自然光最好，如果没有，选择色温接近自然光的台灯。避免屏幕眩光，可以使用防眩光屏幕保护膜。</p>
          
          <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=400&fit=crop" alt="Home Office" />
          
          <h2>时间管理技巧</h2>
          <p>在家工作最大的挑战之一是时间管理。没有了办公室的通勤和日常节奏，很容易拖延或者工作过度。</p>
          
          <h3>番茄工作法</h3>
          <p>将工作分成25分钟的专注时段，中间休息5分钟。每4个番茄钟后休息15-30分钟。这种方法可以帮助保持专注，同时避免 burnout。</p>
          
          <h3>设定清晰的工作时间</h3>
          <p>就像在办公室一样，设定固定的开始和结束时间。到了下班时间，关闭工作应用，避免在休息时间回复工作消息。</p>
          
          <h2>保持身心健康</h2>
          <p>远程工作很容易让人陷入久坐不动的状态。定时休息和运动对身心健康至关重要。</p>
          
          <ul>
            <li>每小时站起来活动5分钟</li>
            <li>做一些简单的伸展运动</li>
            <li>午休时间出去散步</li>
            <li>保持规律的作息时间</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop" alt="Wellness" />
          
          <h2>有效沟通的策略</h2>
          <p>远程团队的成功很大程度上取决于有效的沟通。使用合适的工具，建立清晰的沟通规范。</p>
          
          <p>记住，远程工作的目标是提高生活质量，而不是让工作占据生活的全部。找到适合自己的节奏，保持工作与生活的平衡！</p>
        `,
      },
      en: {
        title: 'Remote Work Productivity Guide',
        excerpt: 'Learn how to stay productive in a remote work environment and balance work with life.',
        content: `
          <h2>The Rise of Remote Work</h2>
          <p>Remote work has become the new normal, with more companies adopting hybrid work models. According to recent surveys, over 60% of professionals now work from home at least part of the time. This way of working offers unprecedented flexibility but also presents unique challenges.</p>
          
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop" alt="Remote Work" />
          
          <h2>Creating an Efficient Home Office</h2>
          <p>A good work environment is the foundation of productivity. First, you need a dedicated workspace, preferably a room with a door. This helps psychologically separate work from rest time.</p>
          
          <h3>1. Invest in Ergonomic Furniture</h3>
          <p>Invest in a good chair and an adjustable desk. Sitting for long periods puts stress on your body, and proper posture and support can prevent back and neck problems.</p>
          
          <h3>2. Good Lighting</h3>
          <p>Natural light is best, but if not available, choose a desk lamp with a color temperature close to natural light. Avoid screen glare with anti-glare screen protectors.</p>
          
          <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=400&fit=crop" alt="Home Office" />
          
          <h2>Time Management Techniques</h2>
          <p>One of the biggest challenges of working from home is time management. Without office commute and daily routines, it's easy to procrastinate or overwork.</p>
          
          <h3>Pomodoro Technique</h3>
          <p>Break work into 25-minute focus periods with 5-minute breaks. After every 4 pomodoros, take a 15-30 minute break. This method helps maintain focus while avoiding burnout.</p>
          
          <h3>Set Clear Working Hours</h3>
          <p>Just like in the office, set fixed start and end times. When work time is over, close work applications and avoid replying to work messages during rest time.</p>
          
          <h2>Maintaining Physical and Mental Health</h2>
          <p>Remote work can easily lead to a sedentary lifestyle. Regular breaks and exercise are essential for physical and mental health.</p>
          
          <ul>
            <li>Stand up and move for 5 minutes every hour</li>
            <li>Do some simple stretching exercises</li>
            <li>Go for a walk during lunch break</li>
            <li>Maintain a regular sleep schedule</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop" alt="Wellness" />
          
          <h2>Effective Communication Strategies</h2>
          <p>The success of remote teams depends heavily on effective communication. Use appropriate tools and establish clear communication norms.</p>
          
          <p>Remember, the goal of remote work is to improve quality of life, not let work take over your entire life. Find your own rhythm and maintain work-life balance!</p>
        `,
      },
      ja: {
        title: 'リモートワーク生産性向上ガイド',
        excerpt: 'リモートワーク環境で効率的に働き、ワークライフバランスを保つ方法を学びましょう。',
        content: `
          <h2>リモートワークの台頭</h2>
          <p>リモートワークは新しい常識となり、ますます多くの企業がハイブリッドな勤務形態を採用しています。最新の調査によると、60%以上の専門家が現在、少なくとも一部の時間を在宅で仕事しています。この働き方は前例のない柔軟性をもたらしますが、独自の課題ももたらします。</p>
          
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop" alt="Remote Work" />
          
          <h2>効率的な在宅オフィスの構築</h2>
          <p>良い作業環境は生産性の基礎です。まず、専用の作業スペースが必要で、できればドアのある部屋が良いでしょう。これにより、心理的に仕事と休息時間を区切ることができます。</p>
          
          <h3>1. 人間工学に基づいた家具への投資</h3>
          <p>良い椅子と高さ調整可能なデスクに投資しましょう。長時間座って仕事をすると体に負担がかかります。正しい姿勢とサポートにより、背中や首の問題を予防できます。</p>
          
          <h3>2. 良い照明</h3>
          <p>自然光が最善ですが、なければ自然光に近い色温度のデスクライトを選びましょう。画面の映り込みを防ぐために、アンチグレアスクリーンプロテクターを使用することもできます。</p>
          
          <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=400&fit=crop" alt="Home Office" />
          
          <h2>時間管理テクニック</h2>
          <p>在宅勤務の最大の課題の1つは時間管理です。オフィス通勤や日常のリズムがないと、先延ばしにしたり働きすぎたりしやすくなります。</p>
          
          <h3>ポモドーロテクニック</h3>
          <p>仕事を25分の集中時間に分け、その間に5分の休憩を取ります。4つのポモドーロごとに15〜30分の休憩を取ります。この方法は、燃え尽きを防ぎながら集中力を維持するのに役立ちます。</p>
          
          <h3>明確な勤務時間を設定する</h3>
          <p>オフィスにいるときと同じように、固定の開始時刻と終了時刻を設定しましょう。勤務時間が終わったら、仕事用アプリケーションを閉じ、休憩時間中に仕事のメッセージに返信しないようにしましょう。</p>
          
          <h2>心身の健康を維持する</h2>
          <p>リモートワークでは、座りっぱなしの生活になりやすいものです。定期的な休憩と運動が心身の健康に不可欠です。</p>
          
          <ul>
            <li>1時間ごとに5分立って動く</li>
            <li>簡単なストレッチをする</li>
            <li>昼休みに散歩に出かける</li>
            <li>規則正しい睡眠スケジュールを維持する</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop" alt="Wellness" />
          
          <h2>効果的なコミュニケーション戦略</h2>
          <p>リモートチームの成功は、効果的なコミュニケーションに大きく依存しています。適切なツールを使用し、明確なコミュニケーション規範を確立しましょう。</p>
          
          <p>リモートワークの目標は、生活の質を向上させることであり、仕事に生活全体を奪われることではないことを忘れないでください。自分に合ったリズムを見つけ、ワークライフバランスを維持しましょう！</p>
        `,
      },
    },
    tags: ['Remote Work', 'Productivity', 'Work-Life Balance'],
  },
  {
    slug: 'personal-finance-basics-beginners',
    status: 'PUBLISHED',
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: '个人理财入门基础',
        excerpt: '从零开始学习个人理财，建立健康的财务习惯。',
        content: `
          <h2>理财的重要性</h2>
          <p>良好的理财习惯可以帮助你实现财务自由，减轻生活压力，为未来做好准备。无论你的收入水平如何，理财都是每个人都应该掌握的基本技能。</p>
          
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop" alt="Finance" />
          
          <h2>第一步：了解你的财务状况</h2>
          <p>在开始理财之前，你需要清楚地了解自己当前的财务状况。这包括收入、支出、资产和负债。</p>
          
          <h3>制作收支表</h3>
          <p>记录每个月的所有收入和支出。你可以使用电子表格、记账应用或简单的笔记本。关键是要坚持记录，这样才能发现可以节省的地方。</p>
          
          <h3>计算净值</h3>
          <p>净值 = 资产 - 负债。这是衡量你财务健康状况的重要指标。定期计算净值可以看到你的进步。</p>
          
          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop" alt="Budgeting" />
          
          <h2>建立紧急基金</h2>
          <p>紧急基金是财务安全的基础。它可以帮助你应对意外开支，如医疗费用、汽车维修或失业。</p>
          
          <h3>目标金额</h3>
          <p>理想情况下，紧急基金应该覆盖3-6个月的必要开支。先从小目标开始，比如先存1000美元，然后逐步增加。</p>
          
          <h3>存放位置</h3>
          <p>紧急基金应该存放在容易存取但又不会轻易花掉的地方，比如高收益储蓄账户或货币市场基金。</p>
          
          <h2>债务管理策略</h2>
          <p>高息债务是财富积累的最大敌人。制定计划还清债务是理财的重要一步。</p>
          
          <h3>雪球法 vs 雪崩法</h3>
          <p>雪球法：先还最小的债务，获得心理上的胜利。雪崩法：先还利息最高的债务，节省更多利息。选择适合你性格的方法。</p>
          
          <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop" alt="Investing" />
          
          <h2>开始投资</h2>
          <p>一旦紧急基金建立并且高息债务还清，就可以开始投资了。投资是让你的钱为你工作的方式。</p>
          
          <ul>
            <li>了解不同的投资产品：股票、债券、基金</li>
            <li>分散投资降低风险</li>
            <li>长期投资，利用复利效应</li>
            <li>考虑退休账户的税收优惠</li>
          </ul>
          
          <h2>制定预算和储蓄目标</h2>
          <p>50/30/20法则是一个简单有效的预算方法：50%用于必要开支，30%用于想要的东西，20%用于储蓄和还债。</p>
          
          <p>记住，理财是一个长期的过程，需要耐心和坚持。从小处着手，逐步建立良好的财务习惯！</p>
        `,
      },
      en: {
        title: 'Personal Finance Basics for Beginners',
        excerpt: 'Learn personal finance from scratch and build healthy financial habits.',
        content: `
          <h2>The Importance of Financial Management</h2>
          <p>Good financial habits can help you achieve financial freedom, reduce life stress, and prepare for the future. Regardless of your income level, financial management is a basic skill everyone should master.</p>
          
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop" alt="Finance" />
          
          <h2>Step One: Understand Your Financial Situation</h2>
          <p>Before you start managing your finances, you need to clearly understand your current financial situation. This includes income, expenses, assets, and liabilities.</p>
          
          <h3>Create an Income and Expense Statement</h3>
          <p>Record all income and expenses each month. You can use spreadsheets, budgeting apps, or a simple notebook. The key is to be consistent so you can find areas to save.</p>
          
          <h3>Calculate Your Net Worth</h3>
          <p>Net worth = Assets - Liabilities. This is an important indicator of your financial health. Calculating net worth regularly shows your progress.</p>
          
          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop" alt="Budgeting" />
          
          <h2>Build an Emergency Fund</h2>
          <p>An emergency fund is the foundation of financial security. It can help you deal with unexpected expenses like medical bills, car repairs, or unemployment.</p>
          
          <h3>Target Amount</h3>
          <p>Ideally, an emergency fund should cover 3-6 months of essential expenses. Start with small goals, like saving $1000 first, then gradually increase.</p>
          
          <h3>Where to Keep It</h3>
          <p>Emergency funds should be kept somewhere accessible but not easy to spend, like high-yield savings accounts or money market funds.</p>
          
          <h2>Debt Management Strategies</h2>
          <p>High-interest debt is the biggest enemy of wealth accumulation. Creating a plan to pay off debt is an important step in financial management.</p>
          
          <h3>Snowball Method vs Avalanche Method</h3>
          <p>Snowball method: Pay off the smallest debt first for psychological wins. Avalanche method: Pay off highest interest debt first to save more interest. Choose the method that fits your personality.</p>
          
          <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop" alt="Investing" />
          
          <h2>Start Investing</h2>
          <p>Once you've built an emergency fund and paid off high-interest debt, you can start investing. Investing is how you make your money work for you.</p>
          
          <ul>
            <li>Learn about different investment products: stocks, bonds, funds</li>
            <li>Diversify to reduce risk</li>
            <li>Invest long-term, leverage compound interest</li>
            <li>Consider tax benefits of retirement accounts</li>
          </ul>
          
          <h2>Set Budget and Savings Goals</h2>
          <p>The 50/30/20 rule is a simple and effective budgeting method: 50% for essential expenses, 30% for things you want, 20% for savings and debt repayment.</p>
          
          <p>Remember, financial management is a long-term process that requires patience and consistency. Start small and gradually build good financial habits!</p>
        `,
      },
      ja: {
        title: '初心者向けパーソナルファイナンス入門',
        excerpt: 'ゼロから個人の財務管理を学び、健全な財務習慣を構築しましょう。',
        content: `
          <h2>財務管理の重要性</h2>
          <p>良好な財務習慣は、財務の自由を実現し、生活のストレスを軽減し、未来に備えるのに役立ちます。収入レベルに関係なく、財務管理は誰もが身につけるべき基本的なスキルです。</p>
          
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop" alt="Finance" />
          
          <h2>ステップ1：財務状況を理解する</h2>
          <p>財務管理を始める前に、現在の財務状況を明確に理解する必要があります。これには収入、支出、資産、負債が含まれます。</p>
          
          <h3>収支表を作成する</h3>
          <p>毎月のすべての収入と支出を記録しましょう。スプレッドシート、家計簿アプリ、またはシンプルなノートを使用できます。重要なのは一貫して記録することで、これにより節約できる箇所を見つけることができます。</p>
          
          <h3>純資産を計算する</h3>
          <p>純資産 = 資産 - 負債。これは財務の健全性を測る重要な指標です。定期的に純資産を計算することで、進捗を確認できます。</p>
          
          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop" alt="Budgeting" />
          
          <h2>緊急資金を構築する</h2>
          <p>緊急資金は財務の安全の基礎です。医療費、車の修理、失業などの予期せぬ出費に対応するのに役立ちます。</p>
          
          <h3>目標金額</h3>
          <p>理想的には、緊急資金は3〜6ヶ月の必要経費をカバーする必要があります。まずは小さな目標から始めましょう。たとえば、まず1000ドルを貯めて、徐々に増やしていきます。</p>
          
          <h3>保管場所</h3>
          <p>緊急資金は、簡単にアクセスできるけれども簡単に使ってしまわない場所に保管する必要があります。高金利の普通預金口座やマネーマーケットファンドなどです。</p>
          
          <h2>負債管理戦略</h2>
          <p>高金利の負債は富の蓄積の最大の敵です。負債を返済する計画を立てることは、財務管理の重要な一歩です。</p>
          
          <h3>スノーボール法 vs アバランシェ法</h3>
          <p>スノーボール法：心理的な勝利を得るために、最小の負債から先に返済します。アバランシェ法：より多くの利息を節約するために、最も高い金利の負債から先に返済します。自分の性格に合った方法を選びましょう。</p>
          
          <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop" alt="Investing" />
          
          <h2>投資を始める</h2>
          <p>緊急資金を構築し、高金利の負債を返済したら、投資を始めることができます。投資は、あなたのお金に働いてもらう方法です。</p>
          
          <ul>
            <li>さまざまな投資商品を学ぶ：株式、債券、ファンド</li>
            <li>分散投資でリスクを軽減する</li>
            <li>長期投資で複利効果を活用する</li>
            <li>退職口座の税制優遇を検討する</li>
          </ul>
          
          <h2>予算と貯蓄目標を設定する</h2>
          <p>50/30/20ルールはシンプルで効果的な予算方法です：50%を必要経費に、30%を欲しいものに、20%を貯蓄と負債返済に充てます。</p>
          
          <p>財務管理は長期的なプロセスであり、忍耐と一貫性が必要であることを忘れないでください。小さなことから始めて、徐々に良好な財務習慣を構築しましょう！</p>
        `,
      },
    },
    tags: ['Finance', 'Personal Finance', 'Investing'],
  },
  {
    slug: 'healthy-eating-habits-guide',
    status: 'PUBLISHED',
    isPremium: false,
    coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=630&fit=crop',
    translations: {
      zh: {
        title: '健康饮食习惯养成指南',
        excerpt: '学习如何建立健康的饮食习惯，改善整体健康状况。',
        content: `
          <h2>营养的重要性</h2>
          <p>食物是我们身体的燃料。我们吃的东西直接影响我们的能量水平、情绪、免疫系统和长期健康。良好的营养可以预防慢性疾病，提高生活质量。</p>
          
          <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop" alt="Healthy Eating" />
          
          <h2>均衡饮食的基础</h2>
          <p>一个均衡的饮食应该包含各种食物类别。每餐都应该有蛋白质、复合碳水化合物、健康脂肪和蔬菜。</p>
          
          <h3>主要营养类别</h3>
          <p><strong>蛋白质</strong>：肌肉修复和免疫功能。来源包括鱼、鸡肉、豆类、豆腐。</p>
          <p><strong>碳水化合物</strong>：主要能量来源。选择全谷物如糙米、全麦面包。</p>
          <p><strong>健康脂肪</strong>：大脑健康和激素生产。鳄梨、坚果、橄榄油是好的选择。</p>
          
          <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop" alt="Vegetables" />
          
          <h2>多吃水果和蔬菜</h2>
          <p>目标是每天吃5份以上的水果和蔬菜。它们富含维生素、矿物质和纤维，热量又低。</p>
          
          <h3>让蔬菜更美味的方法</h3>
          <p>用香料和香草调味，烤蔬菜增加甜味，或者做成美味的沙拉。尝试新的蔬菜种类，保持饮食的多样性。</p>
          
          <h2>水分补充</h2>
          <p>水对身体的每个系统都很重要。目标是每天喝8杯水，或者根据你的活动水平和气候调整。</p>
          
          <ul>
            <li>随身携带水瓶</li>
            <li>在餐间喝水，而不是只在吃饭时</li>
            <li>吃富含水分的水果，如西瓜和橙子</li>
            <li>限制含糖饮料和过多咖啡因</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=400&fit=crop" alt="Water" />
          
          <h2>正念饮食</h2>
          <p>注意你的身体饥饿和饱足的信号。慢慢吃，享受每一口。避免在看电视或工作时吃东西，这样容易吃过量。</p>
          
          <h2>计划和准备</h2>
          <p>周末花时间计划下周的餐点，提前准备食材。这样可以减少外卖和不健康的选择。</p>
          
          <p>记住，健康饮食不是完美主义，而是持续的进步。做出小的、可持续的改变，随着时间的推移会产生大的影响！</p>
        `,
      },
      en: {
        title: 'Healthy Eating Habits Guide',
        excerpt: 'Learn how to build healthy eating habits and improve overall health.',
        content: `
          <h2>The Importance of Nutrition</h2>
          <p>Food is fuel for our bodies. What we eat directly affects our energy levels, mood, immune system, and long-term health. Good nutrition can prevent chronic diseases and improve quality of life.</p>
          
          <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop" alt="Healthy Eating" />
          
          <h2>Basics of a Balanced Diet</h2>
          <p>A balanced diet should include various food groups. Every meal should have protein, complex carbohydrates, healthy fats, and vegetables.</p>
          
          <h3>Main Nutrient Categories</h3>
          <p><strong>Protein</strong>: Muscle repair and immune function. Sources include fish, chicken, beans, tofu.</p>
          <p><strong>Carbohydrates</strong>: Main energy source. Choose whole grains like brown rice, whole wheat bread.</p>
          <p><strong>Healthy Fats</strong>: Brain health and hormone production. Avocados, nuts, olive oil are good choices.</p>
          
          <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop" alt="Vegetables" />
          
          <h2>Eat More Fruits and Vegetables</h2>
          <p>Aim for 5+ servings of fruits and vegetables daily. They're rich in vitamins, minerals, and fiber, yet low in calories.</p>
          
          <h3>How to Make Vegetables More Delicious</h3>
          <p>Season with spices and herbs, roast vegetables for sweetness, or make delicious salads. Try new vegetable varieties to keep your diet diverse.</p>
          
          <h2>Hydration</h2>
          <p>Water is important for every system in the body. Aim for 8 glasses of water daily, or adjust based on your activity level and climate.</p>
          
          <ul>
            <li>Carry a water bottle with you</li>
            <li>Drink water between meals, not just with meals</li>
            <li>Eat water-rich fruits like watermelon and oranges</li>
            <li>Limit sugary drinks and too much caffeine</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=400&fit=crop" alt="Water" />
          
          <h2>Mindful Eating</h2>
          <p>Pay attention to your body's hunger and fullness signals. Eat slowly and enjoy each bite. Avoid eating while watching TV or working, which can lead to overeating.</p>
          
          <h2>Plan and Prepare</h2>
          <p>Spend time on weekends planning next week's meals and preparing ingredients in advance. This reduces takeout and unhealthy choices.</p>
          
          <p>Remember, healthy eating isn't about perfection, it's about consistent progress. Make small, sustainable changes that will have a big impact over time!</p>
        `,
      },
      ja: {
        title: '健康的な食習慣構築ガイド',
        excerpt: '健康的な食習慣を確立し、全体的な健康状態を改善する方法を学びましょう。',
        content: `
          <h2>栄養の重要性</h2>
          <p>食べ物は私たちの体の燃料です。食べるものは、エネルギーレベル、気分、免疫システム、長期的な健康に直接影響します。良好な栄養は慢性疾患を予防し、生活の質を向上させることができます。</p>
          
          <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop" alt="Healthy Eating" />
          
          <h2>バランスの取れた食事の基礎</h2>
          <p>バランスの取れた食事には、さまざまな食品カテゴリーが含まれている必要があります。毎食、タンパク質、複合炭水化物、健康的な脂肪、野菜を含める必要があります。</p>
          
          <h3>主な栄養カテゴリー</h3>
          <p><strong>タンパク質</strong>：筋肉の修復と免疫機能。魚、鶏肉、豆、豆腐などがソースになります。</p>
          <p><strong>炭水化物</strong>：主要なエネルギー源。玄米や全粒小麦パンなどの全粒穀物を選びましょう。</p>
          <p><strong>健康的な脂肪</strong>：脳の健康とホルモン生成。アボカド、ナッツ、オリーブオイルが良い選択です。</p>
          
          <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop" alt="Vegetables" />
          
          <h2>果物と野菜をもっと食べる</h2>
          <p>1日に5食分以上の果物と野菜を食べることを目標にしましょう。ビタミン、ミネラル、食物繊維が豊富で、カロリーは低いです。</p>
          
          <h3>野菜をより美味しくする方法</h3>
          <p>スパイスやハーブで味付けしたり、野菜をローストして甘みを出したり、美味しいサラダを作ったりしましょう。新しい種類の野菜を試して、食事を多様に保ちましょう。</p>
          
          <h2>水分補給</h2>
          <p>水は体のあらゆるシステムに重要です。1日に8杯の水を飲むことを目標にするか、活動レベルや気候に合わせて調整しましょう。</p>
          
          <ul>
            <li>水筒を持ち歩く</li>
            <li>食事の時だけでなく、食事の合間にも水を飲む</li>
            <li>スイカやオレンジなど水分の多い果物を食べる</li>
            <li>砂糖入りの飲み物やカフェインの取りすぎを制限する</li>
          </ul>
          
          <img src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=400&fit=crop" alt="Water" />
          
          <h2>マインドフルイーティング</h2>
          <p>体の空腹感と満腹感の信号に注意を払いましょう。ゆっくり食べて、一口一口を楽しみましょう。テレビを見ながらや仕事をしながら食べることは避けましょう。そうすると食べ過ぎてしまう可能性があります。</p>
          
          <h2>計画と準備</h2>
          <p>週末に時間をかけて来週の食事を計画し、事前に食材を準備しましょう。これにより、テイクアウトや不健康な選択を減らすことができます。</p>
          
          <p>健康的な食事は完璧主義ではなく、一貫した進歩であることを忘れないでください。小さくて持続可能な変更を加えることで、時間の経過とともに大きな影響を与えることができます！</p>
        `,
      },
    },
    tags: ['Health', 'Nutrition', 'Wellness'],
  },
];

async function main() {
  console.log('🌱 开始导入第一批3篇文章...');

  let author = await prisma.user.findFirst();
  
  if (!author) {
    console.log('⚠️ 未找到用户，请先运行基础种子数据');
    return;
  }

  const allTagsSet = new Set<string>();
  batch1Articles.forEach(article => {
    article.tags.forEach(tag => allTagsSet.add(tag));
  });

  console.log(`📝 创建 ${allTagsSet.size} 个标签...`);
  
  const tagMap: Record<string, any> = {};
  for (const tagName of allTagsSet) {
    const slug = tagName.toLowerCase().replace(/\s+/g, '-');
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: {
        name: tagName,
        slug,
        color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      },
    });
    tagMap[tagName] = tag;
  }

  console.log('✅ 标签创建完成');

  let successCount = 0;
  let skipCount = 0;

  for (const articleData of batch1Articles) {
    const existing = await prisma.article.findUnique({
      where: { slug: articleData.slug },
    });

    if (existing) {
      console.log(`⏭️ 文章已存在，跳过: ${articleData.slug}`);
      skipCount++;
      continue;
    }

    const article = await prisma.article.create({
      data: {
        slug: articleData.slug,
        authorId: author.id,
        status: articleData.status,
        isPremium: articleData.isPremium,
        premiumPrice: articleData.premiumPrice,
        coverImage: articleData.coverImage,
        publishedAt: new Date(),
        translations: {
          create: [
            {
              locale: 'zh',
              title: articleData.translations.zh.title,
              excerpt: articleData.translations.zh.excerpt,
              content: articleData.translations.zh.content.trim(),
            },
            {
              locale: 'en',
              title: articleData.translations.en.title,
              excerpt: articleData.translations.en.excerpt,
              content: articleData.translations.en.content.trim(),
            },
            {
              locale: 'ja',
              title: articleData.translations.ja.title,
              excerpt: articleData.translations.ja.excerpt,
              content: articleData.translations.ja.content.trim(),
            },
          ],
        },
        tags: {
          create: articleData.tags.map(tagName => ({
            tag: {
              connect: { id: tagMap[tagName].id },
            },
          })),
        },
      },
      include: {
        translations: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    console.log(`✅ 文章创建成功: ${article.slug}`);
    successCount++;
  }

  console.log('\n🎉 第一批文章导入完成!');
  console.log(`   成功: ${successCount} 篇`);
  console.log(`   跳过: ${skipCount} 篇`);
}

main()
  .catch((e) => {
    console.error('❌ 导入文章失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
