// 全局状态
let currentEventType = 'good';
let selectedUser = 'A';
let allEvents = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadEvents();
  setupRealtimeSubscription();
});

// 打开弹窗
function openModal(type) {
  currentEventType = type;
  const modal = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitBtn');
  const contentInput = document.getElementById('eventContent');

  title.textContent = type === 'good' ? '记录好事' : '记录坏事';
  contentInput.placeholder = type === 'good' ? '发生了什么好事？' : '发生了什么坏事？';
  submitBtn.className = `btn btn-submit ${type}`;

  // 清空表单
  document.getElementById('eventContent').value = '';
  document.getElementById('eventObject').value = '';

  modal.classList.add('active');
}

// 关闭弹窗
function closeModal() {
  const modal = document.getElementById('modalOverlay');
  modal.classList.remove('active');
}

// 选择用户
function selectUser(user) {
  selectedUser = user;
  document.querySelectorAll('.user-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.user === user);
  });
}

// 提交事件
async function submitEvent() {
  const content = document.getElementById('eventContent').value.trim();
  const object = document.getElementById('eventObject').value.trim();

  if (!content) {
    alert('请输入事件内容');
    return;
  }

  const eventData = {
    content,
    object: object || '无',
    user_id: selectedUser,
    type: currentEventType,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabaseClient
      .from(TABLE_NAME)
      .insert([eventData])
      .select();

    if (error) throw error;

    closeModal();
    await loadEvents();
  } catch (error) {
    console.error('提交失败:', error);
    alert('提交失败，请检查网络连接');
  }
}

// 加载事件
async function loadEvents() {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    allEvents = data || [];
    renderEvents();
    updateStats();
  } catch (error) {
    console.error('加载失败:', error);
    renderEvents();
    updateStats();
  }
}

// 渲染事件列表
function renderEvents() {
  const container = document.getElementById('eventsList');
  const userFilter = document.getElementById('userFilter').value;
  const typeFilter = document.getElementById('typeFilter').value;

  let filteredEvents = allEvents;

  if (userFilter !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.user_id === userFilter);
  }

  if (typeFilter !== 'all') {
    filteredEvents = filteredEvents.filter(e => e.type === typeFilter);
  }

  if (filteredEvents.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>还没有记录，点击上方按钮开始记录吧！</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredEvents.map(event => `
    <div class="event-item ${event.type}">
      <div class="event-icon">
        ${event.type === 'good' ? '✓' : '✗'}
      </div>
      <div class="event-content">
        <div class="event-text">${escapeHtml(event.content)}</div>
        <div class="event-meta">
          <span class="event-tag ${event.type}">
            ${event.type === 'good' ? '好事' : '坏事'}
          </span>
          <span>👤 用户 ${event.user_id}</span>
          <span>📌 ${escapeHtml(event.object)}</span>
          <span>🕐 ${formatTime(event.created_at)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// 更新统计
function updateStats() {
  const stats = {
    'A-good': 0,
    'A-bad': 0,
    'B-good': 0,
    'B-bad': 0
  };

  allEvents.forEach(event => {
    const key = `${event.user_id}-${event.type}`;
    stats[key]++;
  });

  document.getElementById('userA-good').textContent = stats['A-good'];
  document.getElementById('userA-bad').textContent = stats['A-bad'];
  document.getElementById('userB-good').textContent = stats['B-good'];
  document.getElementById('userB-bad').textContent = stats['B-bad'];
}

// 筛选事件
function filterEvents() {
  renderEvents();
}

// 设置实时订阅
function setupRealtimeSubscription() {
  supabaseClient
    .channel('events')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: TABLE_NAME },
      (payload) => {
        console.log('实时更新:', payload);
        loadEvents();
      }
    )
    .subscribe();
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }

  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }

  // 大于24小时
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (year === now.getFullYear()) {
    return `${month}-${day} ${hours}:${minutes}`;
  }

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 点击弹窗外部关闭
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    closeModal();
  }
});

// ESC键关闭弹窗
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});
