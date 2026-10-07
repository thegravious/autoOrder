import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer, toast } from 'react-toastify';
import {
  LayoutDashboard, ClipboardList, PlusCircle, Factory, Truck,
  BarChart3, History, Users, Menu, X, Search, Bell, LogOut,
  UserRound, Package, AlertTriangle, CheckCircle2, Clock3,
  ChevronRight, UserCog, Send, CircleDot
} from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

const USERS = [
  { id:'U001', name:'Girish', role:'Admin', username:'girish', password:'admin123' },
  { id:'U002', name:'Vinayak', role:'Admin', title:'Manager', username:'vinayak', password:'admin123' },
  { id:'U003', name:'Sharma', role:'Task Distributor', username:'sharma', password:'task123' },
  { id:'U004', name:'Plant Manager 1', role:'Plant Manager', username:'plant1', password:'plant123' },
  { id:'U005', name:'Plant Manager 2', role:'Plant Manager', username:'plant2', password:'plant123' },
  { id:'U006', name:'Plant Manager 3', role:'Plant Manager', username:'plant3', password:'plant123' },
  { id:'U007', name:'Foam Manager', role:'Foam Manager', username:'foam', password:'foam123' },
  { id:'U008', name:'Dispatch', role:'Dispatch', username:'dispatch', password:'dispatch123' }
];

const initialOrders = [
  { id:'ORD00001', date:'06-Oct-2026', vendor:'ARORA TRA.', material:'Piece', product:'(32BABTA +32 SOFTY) KNITTED 14MM PLUS 7MM BOTH SIDE QUILTED', ordered:1, delivered:0, status:'Pending', plant:'Plant Manager 1', foam:'Available', notes:'' },
  { id:'ORD00002', date:'06-Oct-2026', vendor:'ABC FOAM', material:'Piece', product:'Premium Foam Mattress', ordered:20, delivered:8, status:'Partially Delivered', plant:'Plant Manager 2', foam:'Available', notes:'8 delivered' },
  { id:'ORD00003', date:'06-Oct-2026', vendor:'XYZ TRA.', material:'Piece', product:'High Density Foam', ordered:10, delivered:0, status:'Waiting for Foam', plant:'Plant Manager 3', foam:'Required', notes:'Foam request FR00001' }
];

function App(){
  const [user, setUser] = useState(null);
  if(!user) return <Login onLogin={setUser}/>;
  return <PlantFlow user={user} onLogout={()=>setUser(null)}/>;
}

function Login({onLogin}){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const submit=e=>{
    e.preventDefault();
    const found=USERS.find(u=>u.username===username.trim().toLowerCase() && u.password===password);
    if(!found){ toast.error('Invalid username or password'); return; }
    onLogin(found);
    toast.success(`Welcome, ${found.name}`);
  };
  return <div className="login-page">
    <div className="login-card">
      <div className="brand-mark">PF</div>
      <h1>PlantFlow</h1>
      <p className="muted">Order, production & dispatch management</p>
      <form onSubmit={submit}>
        <label>Username<input value={username} onChange={e=>setUsername(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
        <button className="primary full">Sign in</button>
      </form>
      <div className="login-hint">
        <b>Demo accounts</b>
        <span>Girish: girish / admin123</span>
        <span>Vinayak: vinayak / admin123</span>
        <span>Sharma: sharma / task123</span>
      </div>
    </div>
    <ToastContainer position="top-right" autoClose={2600} />
  </div>
}

function PlantFlow({user,onLogout}){
  const [page,setPage]=useState('dashboard');
  const [sidebar,setSidebar]=useState(true);
  const [orders,setOrders]=useState(initialOrders);
  const [query,setQuery]=useState('');
  const [modal,setModal]=useState(null);

  const isAdmin=user.role==='Admin';
  const canDistribute=isAdmin || user.role==='Task Distributor';
  const canCreate=isAdmin;
  const nav=[
    ['dashboard','Dashboard',LayoutDashboard,true],
    ['orders','Orders',ClipboardList,true],
    ['create','Create Order',PlusCircle,canCreate],
    ['foam','Foam Requests',Factory,isAdmin || user.role==='Foam Manager' || user.role==='Plant Manager'],
    ['production','Production',Factory,isAdmin || user.role==='Plant Manager'],
    ['dispatch','Dispatch & Delivery',Truck,isAdmin || user.role==='Dispatch'],
    ['reports','Reports',BarChart3,true],
    ['audit','Audit Log',History,isAdmin],
    ['users','Users & Roles',Users,isAdmin],
  ].filter(x=>x[3]);

  const filtered=orders.filter(o=>Object.values(o).join(' ').toLowerCase().includes(query.toLowerCase()));

  const createOrder=(data)=>{
    const next=`ORD${String(orders.length+1).padStart(5,'0')}`;
    setOrders(prev=>[...prev,{...data,id:next,delivered:0,status:'Pending',plant:'Unassigned',foam:'Available'}]);
    setModal(null); setPage('orders'); toast.success(`${next} created successfully`);
  };
  const assign=(id,plant)=>{
    setOrders(prev=>prev.map(o=>o.id===id?{...o,plant,status:o.status==='Pending'?'Assigned':o.status}:o));
    toast.success(`${id} assigned to ${plant}`);
  };
  const dispatch=(id,qty)=>{
    setOrders(prev=>prev.map(o=>{
      if(o.id!==id) return o;
      const delivered=Math.min(o.ordered,o.delivered+Number(qty));
      return {...o,delivered,status:delivered>=o.ordered?'Completed':'Partially Delivered'};
    }));
    toast.success(`${id} delivery updated`);
  };

  return <div className="app">
    <aside className={`sidebar ${sidebar?'open':''}`}>
      <div className="side-brand"><div className="brand-mark small">PF</div><span>PlantFlow</span></div>
      <div className="role-chip"><UserCog size={15}/><span>{user.name}</span><em>{user.role}</em></div>
      <nav>{nav.map(([id,label,Icon])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><Icon size={18}/><span>{label}</span></button>)}</nav>
      <div className="side-bottom">
        <button onClick={()=>{onLogout();toast.info('Signed out')}}><LogOut size={18}/>Sign out</button>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={()=>setSidebar(v=>!v)}><Menu/></button>
        <div className="top-title"><span>PlantFlow</span><b>{page.replace('-', ' ')}</b></div>
        <div className="top-actions">
          <div className="search"><Search size={17}/><input placeholder="Search orders..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
          <button className="icon-btn"><Bell size={18}/><i></i></button>
          <div className="avatar">{user.name[0]}</div>
        </div>
      </header>

      <section className="content">
        {page==='dashboard' && <Dashboard orders={orders} setPage={setPage} />}
        {page==='orders' && <Orders orders={filtered} canDistribute={canDistribute} assign={assign} dispatch={dispatch} onCreate={()=>setModal('create')} />}
        {page==='create' && <CreateOrder onCreate={createOrder}/>}
        {page==='foam' && <Foam orders={orders}/>}
        {page==='production' && <Production orders={orders}/>}
        {page==='dispatch' && <Dispatch orders={orders} dispatch={dispatch}/>}
        {page==='reports' && <Reports orders={orders}/>}
        {page==='audit' && <Audit/>}
        {page==='users' && <UsersRoles/>}
      </section>
    </main>

    {modal==='create' && <Modal title="Create New Order" onClose={()=>setModal(null)}><CreateOrder onCreate={createOrder}/></Modal>}
    <ToastContainer position="top-right" autoClose={2600} newestOnTop />
  </div>
}

function PageHead({title,sub,action}){return <div className="page-head"><div><h1>{title}</h1><p>{sub}</p></div>{action}</div>}

function Dashboard({orders,setPage}){
  const total=orders.length, open=orders.filter(o=>!['Completed','Cancelled','Torn'].includes(o.status)).length;
  const waiting=orders.filter(o=>o.status==='Waiting for Foam').length;
  const partial=orders.filter(o=>o.status==='Partially Delivered').length;
  const completed=orders.filter(o=>o.status==='Completed').length;
  const cards=[
    ['Total Orders',total,ClipboardList,'neutral'],['Open Orders',open,Clock3,'orange'],
    ['Waiting for Foam',waiting,Factory,'purple'],['Partially Delivered',partial,Truck,'blue'],['Completed',completed,CheckCircle2,'green']
  ];
  return <><PageHead title="Dashboard" sub="Live overview of plant operations"/>
    <div className="stat-grid">{cards.map(([label,n,I,c])=><div className="stat-card" key={label}><div className={`stat-icon ${c}`}><I size={20}/></div><div><span>{label}</span><strong>{n}</strong></div></div>)}</div>
    <div className="panel-grid">
      <div className="panel"><div className="panel-head"><div><h3>Recent Orders</h3><p>Latest activity</p></div><button className="link-btn" onClick={()=>setPage('orders')}>View all <ChevronRight size={15}/></button></div>
        <OrderTable orders={orders.slice(0,5)} compact/>
      </div>
      <div className="panel"><div className="panel-head"><div><h3>Workflow</h3><p>Current order stages</p></div></div>
        <div className="workflow">{[['New',2],['Assigned',1],['Production',0],['Ready for Dispatch',0],['Delivered',completed]].map(([x,n])=><div className="workflow-row" key={x}><span><CircleDot size={14}/>{x}</span><b>{n}</b></div>)}</div>
      </div>
    </div>
  </>
}

function Orders({orders,canDistribute,assign,dispatch,onCreate}){
  return <><PageHead title="Orders" sub="Manage the complete order lifecycle" action={<button className="primary" onClick={onCreate}><PlusCircle size={17}/> New Order</button>}/>
    <div className="toolbar"><span>{orders.length} orders</span><div className="filters"><button>All</button><button>Pending</button><button>In Process</button><button>Completed</button></div></div>
    <div className="panel"><OrderTable orders={orders} canDistribute={canDistribute} assign={assign} dispatch={dispatch}/></div>
  </>
}

function OrderTable({orders,compact=false,canDistribute,assign,dispatch}){
  return <div className="table-wrap"><table><thead><tr><th>Order ID</th><th>Vendor</th><th>Product</th><th>Qty</th><th>Delivered</th><th>Status</th><th>Plant</th>{!compact&&<th>Actions</th>}</tr></thead><tbody>
    {orders.map(o=><tr key={o.id}><td><b>{o.id}</b><small>{o.date}</small></td><td>{o.vendor}</td><td className="product-cell">{o.product}</td><td>{o.ordered}</td><td>{o.delivered} / {o.ordered}</td><td><Status s={o.status}/></td><td>{o.plant}</td>{!compact&&<td><div className="row-actions">
      {canDistribute&&<button className="mini" onClick={()=>{const p=prompt('Assign to:',o.plant==='Unassigned'?'Plant Manager 1':o.plant); if(p) assign(o.id,p)}}><Send size={14}/> Assign</button>}
      <button className="mini" onClick={()=>{const q=prompt(`Delivered quantity for ${o.id}:`,String(o.delivered)); if(q!==null && !isNaN(q)) dispatch(o.id,Math.max(0,Number(q)-o.delivered))}}>Delivery</button>
    </div></td>}</tr>)}
    {!orders.length&&<tr><td colSpan="8" className="empty">No orders found</td></tr>}
  </tbody></table></div>
}

function Status({s}){const map={'Pending':'orange','Assigned':'blue','Waiting for Foam':'purple','Partially Delivered':'blue','Completed':'green','In Process':'orange','Torn':'red','Cancelled':'red'};return <span className={`status ${map[s]||'neutral'}`}><i></i>{s}</span>}

function CreateOrder({onCreate}){
  const [f,setF]=useState({date:'06-Oct-2026',vendor:'',material:'Piece',product:'',ordered:1,notes:''});
  const change=e=>setF({...f,[e.target.name]:e.target.value});
  return <div className="form-page"><PageHead title="Create Order" sub="Create a digital order slip"/>
    <div className="form-card"><div className="section-title"><Package size={20}/><div><h3>Order Details</h3><p>The Order ID will be generated automatically.</p></div></div>
      <div className="form-grid">
        <label>Order Date<input name="date" value={f.date} onChange={change}/></label>
        <label>Vendor Name<input name="vendor" placeholder="Enter vendor" value={f.vendor} onChange={change}/></label>
        <label>Material<select name="material" value={f.material} onChange={change}><option>Piece</option><option>Meter</option><option>Kg</option></select></label>
        <label>Ordered Quantity<input type="number" min="1" name="ordered" value={f.ordered} onChange={change}/></label>
        <label className="wide">Product Description<input name="product" placeholder="Enter product description" value={f.product} onChange={change}/></label>
        <label className="wide">Dimensions / Notes<textarea name="notes" rows="3" value={f.notes} onChange={change}/></label>
      </div>
      <div className="form-actions"><button className="primary" onClick={()=>{if(!f.vendor||!f.product){toast.error('Vendor and product are required');return}onCreate({...f,ordered:Number(f.ordered)})}}>Create Order</button></div>
    </div>
  </div>
}

function Foam({orders}){const rows=orders.filter(o=>o.foam==='Required');return <><PageHead title="Foam Requests" sub="Track foam requirements before production"/><div className="panel"><OrderTable orders={rows}/></div></>}
function Production({orders}){return <><PageHead title="Production" sub="Plant production queue"/><div className="panel"><OrderTable orders={orders.filter(o=>o.status!=='Completed')}/></div></>}
function Dispatch({orders,dispatch}){return <><PageHead title="Dispatch & Delivery" sub="Record partial or complete deliveries"/><div className="panel"><OrderTable orders={orders} dispatch={dispatch}/></div></>}
function Reports({orders}){const ordered=orders.reduce((a,o)=>a+Number(o.ordered),0), delivered=orders.reduce((a,o)=>a+Number(o.delivered),0);return <><PageHead title="Reports" sub="Management performance overview"/><div className="report-grid"><div><span>Total Ordered</span><b>{ordered}</b></div><div><span>Total Delivered</span><b>{delivered}</b></div><div><span>Pending Qty</span><b>{ordered-delivered}</b></div><div><span>Completion Rate</span><b>{ordered?Math.round(delivered/ordered*100):0}%</b></div></div></>}
function Audit(){return <><PageHead title="Audit Log" sub="Track important system changes"/><div className="panel"><div className="audit-row"><History size={17}/><div><b>System initialized</b><p>PlantFlow prototype loaded</p></div><time>Today</time></div><div className="audit-row"><UserRound size={17}/><div><b>Role structure updated</b><p>Vinayak → Admin; Sharma → Task Distributor</p></div><time>Today</time></div></div></>}
function UsersRoles(){return <><PageHead title="Users & Roles" sub="Manage access and responsibilities"/><div className="panel"><div className="table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Username</th><th>Access</th></tr></thead><tbody>{USERS.map(u=><tr key={u.id}><td><div className="user-cell"><div className="avatar sm">{u.name[0]}</div><b>{u.name}</b></div></td><td><Status s={u.role}/></td><td>{u.username}</td><td>{u.role==='Admin'?'Full system access':u.role==='Task Distributor'?'Task assignment & distribution':'Role-specific access'}</td></tr>)}</tbody></table></div></div></>}

function Modal({title,onClose,children}){return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}><X/></button></div>{children}</div></div>}

createRoot(document.getElementById('root')).render(<App/>);
