// 常量配置（唯一修改用户名的地方）
const USER_NAMES = { A: '小管', B: '小叶' };
const TYPE_LABELS = { good: '好事', bad: '坏事' };

// 全局状态
let currentEventType = 'good';
let selectedUser = 'A';
let allEvents = [];
let currentView = 'history';
let editingEventId = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initUserUI();
  loadEvents();
  setupRealtimeSubscription();
});

// 从 USER_NAMES 动态生成用户相关 UI
function initUserUI() {
  const userIds = Object.keys(USER_NAMES);

  // 统计面板
  const statsPanel = document.getElementById('statsPanel');
  statsPanel.innerHTML = userIds.flatMap(uid =>
    ['good', 'bad'].map(type => `
      <div class="stat-card ${type}">
        <div class="stat-user">${USER_NAMES[uid]}</div>
        <div class="stat-count" id="user${uid}-${type}">0</div>
        <div class="stat-label">${TYPE_LABELS[type]}</div>
      </div>
    `)
  ).join('');

  // 筛选下拉
  const userFilter = document.getElementById('userFilter');
  userFilter.innerHTML = '<option value="all">所有人</option>' +
    userIds.map(uid => `<option value="${uid}">${USER_NAMES[uid]}</option>`).join('');

  // 弹窗用户选择
  const userSelect = document.getElementById('userSelect');
  userSelect.innerHTML = userIds.map((uid, i) =>
    `<button class="user-btn${i === 0 ? ' active' : ''}" data-user="${uid}" onclick="selectUser('${uid}')">${USER_NAMES[uid]}</button>`
  ).join('');
}

// 打开弹窗（新建）
function openModal(type) {
  currentEventType = type;
  editingEventId = null;
  const modal = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitBtn');
  const contentInput = document.getElementById('eventContent');

  title.textContent = `记录${TYPE_LABELS[type]}`;
  contentInput.placeholder = `发生了什么${TYPE_LABELS[type]}？`;
  submitBtn.textContent = '确认记录';
  submitBtn.className = `btn btn-submit ${type}`;

  // 清空表单
  document.getElementById('eventContent').value = '';
  document.getElementById('eventObject').value = '';

  modal.classList.add('active');
}

// 打开弹窗（编辑）
function openEditModal(id) {
  const event = allEvents.find(e => e.id === id);
  if (!event) return;

  editingEventId = id;
  currentEventType = event.type;
  selectedUser = event.user_id;

  const modal = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitBtn');

  title.textContent = '编辑记录';
  document.getElementById('eventContent').value = event.content;
  document.getElementById('eventObject').value = event.object === '无' ? '' : event.object;

  // 更新用户选择按钮状态
  document.querySelectorAll('.user-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.user === selectedUser);
  });

  submitBtn.textContent = '保存修改';
  submitBtn.className = `btn btn-submit ${event.type}`;

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

// 提交事件（新建或编辑）
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
    type: currentEventType
  };

  try {
    if (editingEventId) {
      // 编辑模式
      const { error } = await supabaseClient
        .from(TABLE_NAME)
        .update(eventData)
        .eq('id', editingEventId);

      if (error) throw error;
    } else {
      // 新建模式
      eventData.created_at = new Date().toISOString();
      const { error } = await supabaseClient
        .from(TABLE_NAME)
        .insert([eventData]);

      if (error) throw error;
    }

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
      .eq('is_deleted', false)
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

// 加载回收站
async function loadTrash() {
  try {
    const { data, error } = await supabaseClient
      .from(TABLE_NAME)
      .select('*')
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false });

    if (error) throw error;

    renderTrash(data || []);
  } catch (error) {
    console.error('加载回收站失败:', error);
    renderTrash([]);
  }
}

// 软删除（移到回收站）
async function deleteEvent(id) {
  if (!confirm('确定要删除这条记录吗？\n可在回收站中恢复。')) return;

  try {
    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await loadEvents();
  } catch (error) {
    console.error('删除失败:', error);
    alert('删除失败，请重试');
  }
}

// 恢复事件
async function restoreEvent(id) {
  try {
    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .update({ is_deleted: false, deleted_at: null })
      .eq('id', id);

    if (error) throw error;

    await loadTrash();
  } catch (error) {
    console.error('恢复失败:', error);
    alert('恢复失败，请重试');
  }
}

// 永久删除
async function permanentDelete(id) {
  if (!confirm('确定要永久删除吗？\n此操作不可恢复！')) return;

  try {
    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;

    await loadTrash();
  } catch (error) {
    console.error('永久删除失败:', error);
    alert('永久删除失败，请重试');
  }
}

// 清空回收站
async function emptyTrash() {
  if (!confirm('确定要清空回收站吗？\n所有记录将被永久删除，此操作不可恢复！')) return;

  try {
    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .delete()
      .eq('is_deleted', true);

    if (error) throw error;

    await loadTrash();
  } catch (error) {
    console.error('清空失败:', error);
    alert('清空失败，请重试');
  }
}

// 切换视图
function switchView(view) {
  currentView = view;
  const historySection = document.getElementById('historySection');
  const trashSection = document.getElementById('trashSection');
  const historyTab = document.getElementById('historyTab');
  const trashTab = document.getElementById('trashTab');

  if (view === 'history') {
    historySection.style.display = 'block';
    trashSection.style.display = 'none';
    historyTab.classList.add('active');
    trashTab.classList.remove('active');
    loadEvents();
  } else {
    historySection.style.display = 'none';
    trashSection.style.display = 'block';
    historyTab.classList.remove('active');
    trashTab.classList.add('active');
    loadTrash();
  }
}

// 渲染单个事件卡片（共享逻辑）
function renderEventCard(event, { isTrash = false } = {}) {
  const actions = isTrash
    ? `<button class="action-btn restore-btn" onclick="restoreEvent(${event.id})" title="恢复">↩️</button>
       <button class="action-btn permanent-btn" onclick="permanentDelete(${event.id})" title="永久删除">❌</button>`
    : `<button class="action-btn edit-btn" onclick="openEditModal(${event.id})" title="编辑">✏️</button>
       <button class="action-btn delete-btn" onclick="deleteEvent(${event.id})" title="删除">🗑️</button>`;

  const timeLabel = isTrash ? '删除于' : '';
  const timeValue = isTrash ? event.deleted_at : event.created_at;

  return `
    <div class="event-item ${event.type}${isTrash ? ' deleted' : ''}">
      <div class="event-icon">${event.type === 'good' ? '✓' : '✗'}</div>
      <div class="event-content">
        <div class="event-text">${escapeHtml(event.content)}</div>
        <div class="event-meta">
          <span class="event-tag ${event.type}">${TYPE_LABELS[event.type]}</span>
          <span>👤 ${USER_NAMES[event.user_id] || event.user_id}</span>
          <span>📌 ${escapeHtml(event.object)}</span>
          <span>🕐 ${timeLabel}${formatTime(timeValue)}</span>
        </div>
      </div>
      <div class="event-actions">${actions}</div>
    </div>`;
}

// 渲染事件列表
function renderEvents() {
  const container = document.getElementById('eventsList');
  const userFilter = document.getElementById('userFilter').value;
  const typeFilter = document.getElementById('typeFilter').value;

  let filteredEvents = allEvents;
  if (userFilter !== 'all') filteredEvents = filteredEvents.filter(e => e.user_id === userFilter);
  if (typeFilter !== 'all') filteredEvents = filteredEvents.filter(e => e.type === typeFilter);

  if (filteredEvents.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><p>还没有记录，点击上方按钮开始记录吧！</p></div>';
    return;
  }

  container.innerHTML = filteredEvents.map(e => renderEventCard(e)).join('');
}

// 渲染回收站
function renderTrash(events) {
  const container = document.getElementById('trashList');

  if (events.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🗑️</div><p>回收站是空的</p></div>';
    return;
  }

  container.innerHTML = events.map(e => renderEventCard(e, { isTrash: true })).join('');
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
