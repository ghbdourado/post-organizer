import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  CirclePlus,
  LayoutGrid,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  UserRoundMinus,
  UserRoundPlus,
  Wand2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statuses = [
  { id: 'ideias', label: 'Ideias', accent: 'violet', icon: Sparkles },
  { id: 'planejadas', label: 'Planejadas', accent: 'cyan', icon: LayoutGrid },
  { id: 'agendadas', label: 'Agendadas', accent: 'amber', icon: CalendarRange },
  { id: 'publicadas', label: 'Publicadas', accent: 'emerald', icon: TrendingUp },
];

const initialPosts = [
  {
    id: '1',
    title: 'Reel de rotina criativa',
    caption: 'Mostre o processo da criação e como você organiza ideias para entregar valor com consistência.',
    status: 'ideias',
    type: 'Reel',
    date: '2026-10-04',
    tag: 'Criativo',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)',
  },
  {
    id: '2',
    title: 'Antes e depois do projeto',
    caption: 'Transforme o problema em solução e mostre a evolução do resultado com prova real.',
    status: 'planejadas',
    type: 'Carrossel',
    date: '2026-10-07',
    tag: 'Case',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #67e8f9 100%)',
  },
  {
    id: '3',
    title: 'Dica de produtividade mensal',
    caption: 'Uma estratégia simples com CTA claro para gerar engajamento e conversão.',
    status: 'agendadas',
    type: 'Post',
    date: '2026-10-10',
    tag: 'Estratégia',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  },
  {
    id: '4',
    title: 'Resultado e feedback do cliente',
    caption: 'Use prova social e narrativa para mostrar autoridade e confiança.',
    status: 'publicadas',
    type: 'Story',
    date: '2026-10-02',
    tag: 'Prova Social',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  },
];

const initialFollowers = [
  { id: 'f1', username: '@beatrizbrand', type: 'new', source: 'Reel', date: '2026-10-01', note: 'Público de nicho', delta: 12 },
  { id: 'f2', username: '@nathalia.r', type: 'new', source: 'Carrossel', date: '2026-09-30', note: 'Atingiu conteúdo de autoridade', delta: 9 },
  { id: 'f3', username: '@alex.moura', type: 'lost', source: 'Post', date: '2026-10-01', note: 'Alcance caiu após CTA fraco', delta: -7 },
  { id: 'f4', username: '@marina.p', type: 'new', source: 'Stories', date: '2026-09-29', note: 'Interação com processo criativo', delta: 11 },
  { id: 'f5', username: '@joao.design', type: 'lost', source: 'Reel', date: '2026-09-27', note: 'Sem retenção no começo', delta: -5 },
  { id: 'f6', username: '@patricia.n', type: 'new', source: 'Landing', date: '2026-09-26', note: 'Chegou pelo conteúdo de prova', delta: 14 },
];

const formatDate = (value) => {
  if (!value) return 'Sem data';
  try {
    return format(parseISO(value), 'dd MMM', { locale: ptBR });
  } catch {
    return value;
  }
};

function App() {
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('flowpost-posts');
    if (!savedPosts) return initialPosts;
    try {
      return JSON.parse(savedPosts);
    } catch {
      return initialPosts;
    }
  });

  const [followers, setFollowers] = useState(() => {
    const savedFollowers = localStorage.getItem('flowpost-followers');
    if (!savedFollowers) return initialFollowers;
    try {
      return JSON.parse(savedFollowers);
    } catch {
      return initialFollowers;
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [csvText, setCsvText] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    caption: '',
    type: 'Post',
    date: '',
    tag: 'Conteúdo',
  });

  useEffect(() => {
    localStorage.setItem('flowpost-posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('flowpost-followers', JSON.stringify(followers));
  }, [followers]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const visiblePosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return posts;

    return posts.filter((post) => {
      const haystack = [post.title, post.caption, post.tag, post.type].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [posts, search]);

  const scheduledPosts = useMemo(
    () =>
      [...posts]
        .filter((post) => ['agendadas', 'publicadas'].includes(post.status))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [posts],
  );

  const totalPlanned = posts.filter((post) => post.status !== 'publicadas').length;
  const upcoming = posts.filter((post) => post.status === 'agendadas').length;
  const finished = posts.filter((post) => post.status === 'publicadas').length;

  const followerStats = useMemo(() => {
    const newFollowers = followers.filter((entry) => entry.type === 'new');
    const lostFollowers = followers.filter((entry) => entry.type === 'lost');
    const totalFollowers = 18240;
    const gains = newFollowers.reduce((sum, entry) => sum + entry.delta, 0);
    const losses = Math.abs(lostFollowers.reduce((sum, entry) => sum + entry.delta, 0));
    const netGrowth = gains - losses;

    return {
      totalFollowers: totalFollowers + netGrowth,
      newFollowers: newFollowers.length,
      lostFollowers: lostFollowers.length,
      netGrowth,
      gains,
      losses,
    };
  }, [followers]);

  const newAccounts = followers.filter((entry) => entry.type === 'new');
  const lostAccounts = followers.filter((entry) => entry.type === 'lost');

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const activePost = posts.find((item) => item.id === active.id);
    if (!activePost) return;

    const overType = over.data?.current?.type;
    const targetStatus =
      overType === 'column'
        ? over.data.current.status
        : posts.find((item) => item.id === over.id)?.status ?? activePost.status;

    if (targetStatus === activePost.status) return;

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === activePost.id ? { ...post, status: targetStatus } : post,
      ),
    );
  };

  const handleAddPost = (event) => {
    event.preventDefault();
    if (!newPost.title.trim() || !newPost.caption.trim()) return;

    const newEntry = {
      id: String(Date.now()),
      title: newPost.title.trim(),
      caption: newPost.caption.trim(),
      type: newPost.type,
      date: newPost.date || new Date().toISOString().slice(0, 10),
      tag: newPost.tag || 'Conteúdo',
      status: 'ideias',
      gradient:
        ['linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)', 'linear-gradient(135deg, #0ea5e9 0%, #67e8f9 100%)', 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'][
          Math.floor(Math.random() * 3)
        ],
    };

    setPosts((currentPosts) => [newEntry, ...currentPosts]);
    setNewPost({ title: '', caption: '', type: 'Post', date: '', tag: 'Conteúdo' });
    setShowForm(false);
  };

  const handleImportFollowers = () => {
    const parsed = csvText
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean)
      .map((row) => row.split(',').map((cell) => cell.trim()));

    if (!parsed.length) return;

    const mapped = parsed.slice(1).map(([username, type, source, date, delta, note]) => ({
      id: String(Date.now() + Math.random()),
      username: username || '@usuario',
      type: (type || 'new').toLowerCase() === 'lost' ? 'lost' : 'new',
      source: source || 'Importação',
      date: date || new Date().toISOString().slice(0, 10),
      delta: Number(delta) || 0,
      note: note || 'Dados importados',
    }));

    if (mapped.length) {
      setFollowers((current) => [...mapped, ...current]);
      setCsvText('');
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-mark">F</div>
          <div>
            <p className="eyebrow">Planner</p>
            <h1>FlowPost</h1>
          </div>
        </div>

        <nav className="menu">
          <button className="menu-item active">
            <LayoutGrid size={18} />
            Painel
          </button>
          <button className="menu-item muted">
            <CalendarRange size={18} />
            Agenda
          </button>
          <button className="menu-item muted">
            <Sparkles size={18} />
            Conteúdo
          </button>
        </nav>

        <button className="primary-button large" onClick={() => setShowForm(true)}>
          <CirclePlus size={18} />
          Novo post
        </button>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Organizador de conteúdo</p>
            <h2>Planejamento editorial</h2>
          </div>

          <label className="search-box">
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar post"
            />
          </label>
        </header>

        <section className="stats-grid">
          <div className="stat-card accent-purple">
            <span>Total em planejamento</span>
            <strong>{totalPlanned}</strong>
          </div>
          <div className="stat-card accent-cyan">
            <span>Agendados</span>
            <strong>{upcoming}</strong>
          </div>
          <div className="stat-card accent-green">
            <span>Publicados</span>
            <strong>{finished}</strong>
          </div>
        </section>

        <section className="follower-metrics">
          <div className="metric-card gain">
            <div className="metric-label">
              <UserRoundPlus size={18} />
              Novos seguidores
            </div>
            <strong>{followerStats.newFollowers}</strong>
            <span>+{followerStats.gains} no período</span>
          </div>
          <div className="metric-card loss">
            <div className="metric-label">
              <UserRoundMinus size={18} />
              Unfollows
            </div>
            <strong>{followerStats.lostFollowers}</strong>
            <span>{followerStats.losses} removidos</span>
          </div>
          <div className="metric-card net">
            <div className="metric-label">
              <Users size={18} />
              Seguidores totais
            </div>
            <strong>{followerStats.totalFollowers.toLocaleString('pt-BR')}</strong>
            <span>{followerStats.netGrowth >= 0 ? '+' : ''}{followerStats.netGrowth} líquido</span>
          </div>
        </section>

        <div className="content-grid">
          <div className="board-panel">
            <div className="board-wrapper">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="board-grid">
                  {statuses.map((status) => (
                    <Column
                      key={status.id}
                      status={status}
                      posts={visiblePosts.filter((post) => post.status === status.id)}
                    />
                  ))}
                </div>
              </DndContext>
            </div>
          </div>

          <aside className="right-stack">
            <div className="schedule-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Agenda</p>
                  <h3>Próximos posts</h3>
                </div>
                <div className="tiny-badge">{scheduledPosts.length}</div>
              </div>

              <div className="agenda-list">
                {scheduledPosts.length === 0 ? (
                  <div className="empty-state-mini">Nenhum item agendado.</div>
                ) : (
                  scheduledPosts.map((post) => (
                    <div className="agenda-item" key={post.id}>
                      <div className="mini-cover" style={{ background: post.gradient }}></div>
                      <div>
                        <strong>{post.title}</strong>
                        <small>{post.type}</small>
                      </div>
                      <span>{formatDate(post.date)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="analytics-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Seguidores</p>
                  <h3>Controle de mudanças</h3>
                </div>
                <div className="tiny-badge">{followers.length}</div>
              </div>

              <div className="follower-totals">
                <div>
                  <ArrowUpRight size={14} />
                  <span>{newAccounts.length} novos</span>
                </div>
                <div>
                  <ArrowDownRight size={14} />
                  <span>{lostAccounts.length} saíram</span>
                </div>
              </div>

              <div className="follower-list">
                {followers.map((item) => (
                  <div key={item.id} className={`follower-item ${item.type}`}>
                    <div className="follower-avatar">{item.username.slice(1, 2).toUpperCase()}</div>
                    <div className="follower-copy">
                      <strong>{item.username}</strong>
                      <small>{item.source}</small>
                    </div>
                    <span className={item.type === 'new' ? 'positive' : 'negative'}>
                      {item.delta > 0 ? '+' : ''}{item.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="import-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Importação</p>
                  <h3>CSV de seguidores</h3>
                </div>
                <Wand2 size={16} />
              </div>

              <textarea
                rows="5"
                value={csvText}
                onChange={(event) => setCsvText(event.target.value)}
                placeholder="username,type,source,date,delta,note"
              />
              <button className="primary-button" onClick={handleImportFollowers}>Importar dados</button>
            </div>
          </aside>
        </div>
      </main>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Novo post</p>
                <h3>Criar conteúdo</h3>
              </div>
              <button className="close-button" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleAddPost} className="post-form">
              <label>
                Título
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(event) => setNewPost({ ...newPost, title: event.target.value })}
                  placeholder="Ex: Vídeo de rotina criativa"
                />
              </label>

              <label>
                Legenda
                <textarea
                  rows="4"
                  value={newPost.caption}
                  onChange={(event) => setNewPost({ ...newPost, caption: event.target.value })}
                  placeholder="Escreva a legenda ou ideia do post..."
                />
              </label>

              <div className="form-row">
                <label>
                  Tipo
                  <select
                    value={newPost.type}
                    onChange={(event) => setNewPost({ ...newPost, type: event.target.value })}
                  >
                    <option>Post</option>
                    <option>Carrossel</option>
                    <option>Reel</option>
                    <option>Story</option>
                  </select>
                </label>

                <label>
                  Data
                  <input
                    type="date"
                    value={newPost.date}
                    onChange={(event) => setNewPost({ ...newPost, date: event.target.value })}
                  />
                </label>
              </div>

              <label>
                Tag
                <input
                  type="text"
                  value={newPost.tag}
                  onChange={(event) => setNewPost({ ...newPost, tag: event.target.value })}
                  placeholder="Ex: Estratégia"
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  Salvar post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Column({ status, posts }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
    data: { type: 'column', status: status.id },
  });

  const Icon = status.icon;

  return (
    <div ref={setNodeRef} className={`column-panel ${isOver ? 'is-over' : ''}`}>
      <div className={`column-header ${status.accent}`}>
        <div className="header-title">
          <Icon size={16} />
          <span>{status.label}</span>
        </div>
        <span className="count-pill">{posts.length}</span>
      </div>

      <SortableContext items={posts.map((post) => post.id)} strategy={rectSortingStrategy}>
        <div className="column-cards">
          {posts.length === 0 ? (
            <div className="empty-state">Arraste um post para cá</div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function PostCard({ post }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: post.id,
    data: { type: 'post', status: post.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`post-card ${isDragging ? 'is-dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="cover" style={{ background: post.gradient }}>
        <span>{post.type}</span>
      </div>

      <div className="card-body">
        <div className="card-meta">
          <small>{post.tag}</small>
          <small>{formatDate(post.date)}</small>
        </div>

        <h4>{post.title}</h4>
        <p>{post.caption}</p>
      </div>
    </article>
  );
}

export default App;
