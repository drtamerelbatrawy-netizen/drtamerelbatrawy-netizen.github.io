'use strict';

const groups = [
  ['تشغيل المنشأة', 'control dashboard rooms bookings reception housekeeping maintenance'],
  ['المبيعات وتجربة الضيف', 'rates servicePlan channels guests pos events resort feasibility'],
  ['الموارد والرقابة', 'stock folio finance departmentPL operatingCosts staff staffingPlan compliance reports'],
  ['التخطيط والاستثمار', Object.keys(planningTitles).filter(key=>!['servicePlan','feasibility','staffingPlan'].includes(key)).concat('capitalSummary').join(' ')]
];
const statusField = 'status:الحالة';
const modules = {
  ...Object.fromEntries(Object.entries({...planningTitles,...modelPages,...managementPages}).map(([key,title])=>[key,[title]])),
  dashboard: ['لوحة القيادة'],
  rooms: ['الغرف والمرافق','متابعة الإشغال والنظافة وصلاحية البيع لكل وحدة.'],
  bookings: ['الحجوزات','حجز وحدة متاحة مع فحص تداخل الليالي.', 'guest:الضيف room:الغرفة start:الوصول:date end:المغادرة:date source:قناة البيع eventId:الفعالية المرتبطة rate:سعر تعاقدي لليلة اختياري:money'],
  reception: ['الاستقبال والإقامة','تسجيل الوصول بعد التحقق من جاهزية الغرفة، والمغادرة بعد تسوية الحساب.'],
  housekeeping: ['التدبير والمغسلة','تجهيز غرف المغادرة، ثم تسليمها للفحص قبل اعتماد الجاهزية.'],
  maintenance: ['الصيانة والأصول','حجب غرفة عند فتح بلاغ وإعادتها بعد تسجيل نتيجة الفحص.', 'room:الغرفة title:وصف العطل asset:الأصل owner:المسؤول'],
  rates: ['أسعار الغرف والإيرادات','خطط الأسعار والقيود الموسمية والمراجعة.', 'title:الخطة type:نوع الوحدة start:من:date end:إلى:date amount:السعر:money min:أدنى إقامة:number '+statusField],
  channels: ['الحجز المباشر والقنوات','سجل التوزيع وربط الأسعار والعمولات.', 'title:القناة mapping:رمز الربط commission:العمولة %:number factor:معامل السعر %:number '+statusField],
  guests: ['الضيوف والولاء','تفضيلات الضيوف والموافقات ومتابعة الشكاوى.', 'title:الاسم tier:العضوية preference:التفضيل consent:الموافقة issue:طلب أو شكوى'],
  pos: ['المطاعم ونقاط البيع','تسجيل طلب مطعم وتحميله على إقامة نشطة.', 'booking:الإقامة outlet:المنفذ title:الطلب amount:المبلغ:money'],
  events: ['المجموعات والفعاليات','فرص الشركات والقاعات وحصص الغرف وأوامر تشغيل الفعاليات.', 'title:الفعالية company:الشركة hall:القاعة start:البداية:datetime-local end:النهاية:datetime-local rooms:حصة الغرف:number beo:أمر التشغيل '+statusField],
  resort: ['السبا والأنشطة','جدولة الخدمات ومتابعة السعة والموارد.', 'title:النشاط resource:المرفق staff:الموظف equipment:المعدة start:البداية:datetime-local end:النهاية:datetime-local capacity:عدد المشاركين:number '+statusField],
  stock: ['المشتريات والمخزون','طلبات الشراء والاستلام ومطابقة مستندات المورد.', 'title:الصنف store:المخزن supplier:المورد qty:الكمية:number order:أمر الشراء receipt:الاستلام invoice:الفاتورة '+statusField],
  folio: ['حسابات الضيوف وإقفال اليوم','رسوم الليالي والمطاعم والتحصيل لكل إقامة.'],
  finance: ['المحاسبة والموازنة','مراكز التكلفة والموازنة وسجل مراجع القيود.', 'title:الحساب center:المركز period:الفترة budget:الموازنة:money actual:الفعلي:money reference:مرجع القيد '+statusField],
  staff: ['الموظفون والورديات','تكليفات التشغيل والورديات والتدريب.', 'title:الموظف role:الوظيفة team:القسم date:التاريخ:date shift:الوردية training:التدريب '+statusField],
  compliance: ['الجودة والسلامة والامتثال','قوائم مراجعة مرتبطة بالمرجع والمسؤول والدليل.', 'title:البند source:المصدر owner:المسؤول due:الموعد:date evidence:الدليل '+statusField],
  reports: ['التقارير والتحليلات','مؤشرات تحسب من المعاملات المسجلة في النسخة التجريبية.']
};
const key = 'iwan-hotel-demo-1';
const date = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const addDays = (day, offset) => {
  const value = new Date(day+'T00:00:00Z');
  value.setUTCDate(value.getUTCDate()+offset);
  return value.toISOString().slice(0,10);
};
const roomTypes = () => capacityMix().map(x=>x[0]);
const initial = () => ({
  day:date, closed:[], ledger:[], audit:[],
  rooms:hotelRooms([],capacityMix()).map(x=>x.id==='102'?{...x,clean:'تحتاج تنظيف'}:x),
  bookings:[
    {id:'B101',guest:'ضيف تجريبي 1',room:'101',start:date,end:addDays(date,2),rate:450,source:'مباشر',status:'مؤكد'},
    {id:'B102',guest:'ضيف تجريبي 2',room:'103',start:date,end:addDays(date,1),rate:540,source:'شركة',status:'مقيم'},
    {id:'B103',guest:'ضيف تجريبي 3',room:'102',start:date,end:addDays(date,1),rate:390,source:'مباشر',status:'مؤكد'}
  ],
  maintenance:[], rates:[{id:'R1',title:'السعر المرن',type:roomTypes()[0],start:date,end:addDays(date,30),amount:450,min:1,status:'تجريبي'}],
  channels:[{id:'C1',title:'الحجز المباشر',mapping:'DIRECT',commission:0,status:'سجل تجريبي'}],
  guests:[], pos:[], events:[], resort:[], stock:[], finance:[], staff:[],
  compliance:[
    {id:'Q1',title:'توثيق التراخيص والشهادات',source:'اشتراطات مرافق الإيواء السياحي.docx',owner:'الإدارة',status:'قيد المراجعة'},
    {id:'Q2',title:'مراجعة تصنيف الفندق والتجهيزات',source:'الإشتراطات الإلزامية لفندق 4 نجوم.docx',owner:'الجودة',status:'قيد المراجعة'},
    {id:'Q3',title:'مراجعة ترخيص وربط الرصد السياحي',source:'الخريطة الشاملة — التحقق الخاص بالتشغيل في السعودية',owner:'الإدارة',status:'قيد المراجعة'}
  ]
});
function seedExampleRecords(data) {
  const samples = {
    maintenance:[{id:'M-DEMO',room:'104',title:'تنظيف فلتر التكييف',asset:'وحدة تكييف الغرفة',owner:'الهندسة',status:'مغلق'}],
    guests:[{id:'G-DEMO',title:'ضيف تجريبي 2',tier:'فضية',preference:'غرفة هادئة',consent:'موافقة تجريبية',issue:'طلب وسادة إضافية'}],
    channels:[{id:'C-DEMO',title:'حجوزات الشركات',mapping:'CORP',commission:6,status:'تعاقد تجريبي'}],
    pos:[{id:'P-DEMO',booking:'B102',outlet:'المطعم الرئيسي',title:'عشاء تجريبي',amount:140}],
    events:[{id:'E-DEMO',title:'اجتماع فريق المبيعات',company:'شركة تجريبية',hall:'قاعة 1',start:date+'T10:00',end:date+'T14:00',rooms:6,beo:'ضيافة 24 شخصًا وشاشة عرض',status:'مؤكد'}],
    resort:[{id:'A-DEMO',title:'تدليك استرخاء',resource:'غرفة علاج 1',staff:'معالج الوردية',equipment:'سرير علاجي 1',start:date+'T15:00',end:date+'T16:00',capacity:1,status:'مؤكد'}],
    stock:[{id:'S-DEMO',title:'طقم مناشف حمام',store:'مخزن البياضات',supplier:'مورد تجريبي',qty:36,order:'PO-101',receipt:'GR-101',invoice:'IV-101',status:'مطابق'}],
    finance:[{id:'F-DEMO',title:'مستلزمات غرف',center:'تكلفة الإقامة',period:date.slice(0,7),budget:12500,actual:8400,reference:'JV-101',status:'مراجعة أولية'}],
    staff:[{id:'SFT-DEMO',title:'موظف تجريبي',role:'مشرف وردية',team:'الاستقبال',date,shift:'صباحية',training:'تسليم الوردية',status:'مجدول'}]
  };
  for (const [name,records] of Object.entries(samples)) {
    if (!data[name].length && (name!=='pos'||data.bookings.some(b=>b.id==='B102'&&b.status==='مقيم'))) {
      data[name].push(...records);
      if(name==='pos') data.ledger.push({id:'L-DEMO',booking:'B102',title:'المطعم الرئيسي · عشاء تجريبي',amount:140,day:data.day,kind:'pos'});
    }
  }
  for (const record of data.compliance.filter(r=>['Q1','Q2','Q3'].includes(r.id))) {
    record.due ||= addDays(data.day,30);
    record.evidence ||= 'محضر تحقق تجريبي قيد التحضير';
  }
  data.examplesVersion=1;
}
let state;
function activateProperty() {
const stored = JSON.parse(localStorage.getItem(chosenKey()));
const originalSample=preferences.scenario==='hotel'&&stored&&stored.rooms.length===80&&stored.audit.length>0&&stored.audit.every(x=>['إقفال يوم تشغيل تجريبي','تجهيز وردية تجريبية عند إشغال ليلي 60%'].includes(x.label));
state = stored&&!originalSample ? stored : initial();
if(preferences.scenario==='hotel'&&stored&&!originalSample&&state.rooms.length===80&&!preferences.roomMix?.hotel) {
 state.rooms=hotelRooms(state.rooms,capacityMix());
 state.rates=state.rates.map(x=>x.type==='فيلا'?{...x,type:'جناح تنفيذي'}:x);
 localStorage.setItem(chosenKey(),JSON.stringify(state));
}
if (!stored||originalSample) {
  const basePrice=controlProfile().units[0].price;
  state.bookings[0].rate=basePrice;
  state.bookings[1].rate=basePrice;
  state.bookings[2].rate=basePrice;
  const prior=addDays(date,-1);
  state.closed.push(prior);
  state.bookings.push({id:'B100',guest:'إقامة سابقة تجريبية',room:'105',start:prior,end:date,arrived:prior,rate:480,source:'مباشر',status:'غادر'});
  state.ledger.push(
    {id:'PRIOR-ROOM',booking:'B100',title:'ليلة إقامة',amount:480,day:prior,kind:'room'},
    {id:'PRIOR-PAY',booking:'B100',title:'تسوية دفع تجريبية',amount:-480,day:prior,kind:'payment'}
  );
  state.audit.push({at:prior+'T23:59:00+03:00',day:prior,label:'إقفال يوم تشغيل تجريبي'});
  const units=controlProfile().units;
  const rates=Object.fromEntries(units.map(u=>[u.name,u.price]));
  const openings=mixAllocate(Math.max(1,Math.round(total(units,u=>u.count)*preferences.occupancy/100)),units.map(u=>u.count));
  const seeds=units.flatMap((u,i)=>state.rooms.filter(r=>r.type===u.name&&!['101','102','103'].includes(r.id)).slice(0,Math.max(0,openings[i]-(i===0?1:0))));
  for (const [i,r] of seeds.entries()) {
    state.bookings.push({id:'DEMO-'+r.id,guest:'إقامة تجريبية '+(i+4),room:r.id,start:date,arrived:date,
      end:addDays(date,2+i%3),rate:rates[r.type],source:['مباشر','شركة','وكيل'][i%3],status:'مقيم'});
  }
}
if (!state.examplesVersion) {
  seedExampleRecords(state);
  localStorage.setItem(chosenKey(),JSON.stringify(state));
}

salesSeed();seedOperatingDay();selectProperty();
}
function selectProperty(){
 accountId=state.bookings.find(b=>b.status==='مقيم')?.id||state.bookings[0]?.id||'';
 pricingDate=undefined;
 const p=controlProfile(), target=document.querySelector('.property');
 target.innerHTML='<strong>'+esc(p.label)+'</strong><small>'+pn(p.keys)+(p.isApartment?' وحدة ضيافة · ':' غرفة وجناح · ')+esc(p.classification)+' · '+pn(p.restaurants)+' مطاعم · '+pn(p.halls)+' قاعات</small>';
}
const active = b => b.status==='مؤكد' || b.status==='مقيم';
const overlap = (a,b) => a.start<b.end && b.start<a.end;
const currency = new Intl.NumberFormat('en-US',{style:'currency',currency:'SAR',currencyDisplay:'code',maximumFractionDigits:0,minimumFractionDigits:0});
const num = new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
const round = x => Math.round(x*100)/100;
const room = id => state.rooms.find(r=>r.id===id)||state.retiredRooms?.find(r=>r.id===id);
const booking = id => state.bookings.find(b=>b.id===id);
const occupied = id => state.bookings.some(b=>b.room===id&&b.status==='مقيم');
const blocked = id => state.maintenance.some(m=>m.room===id&&m.status!=='مغلق');
const stayRows = id => state.ledger.filter(x=>x.booking===id);
const balance = id => round(stayRows(id).reduce((sum,x)=>sum+x.amount,0));
const fmt = x => currency.format(x);
const esc = x => String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = id => document.getElementById(id);
const id = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+Math.random().toString(36).slice(2);
const badge = (value,warn=false) => '<span class="badge '+(warn?'warning':'')+'">'+esc(value)+'</span>';
const action = (name,label,target='',className='action') => '<button class="'+className+'" data-do="'+name+'" data-id="'+esc(target)+'">'+label+'</button>';
const table = (headers,rows) => rows.length ? '<div class="table"><table><thead><tr>'+headers.map(h=>'<th scope="col">'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>' : '<p class="muted">لا توجد سجلات في هذا العرض.</p>';
const card = (title,value) => '<div class="card"><span>'+title+'</span><strong>'+value+'</strong></div>';
const panel = (title,body) => '<section class="panel"><h2>'+title+'</h2>'+body+'</section>';
const row = (a,b) => '<div class="row"><span>'+a+'</span><span>'+b+'</span></div>';
const fieldsFor = name => modules[name]?.[2]?.split(/\s+(?=\w+:)/).map(f=>f.split(':')) || [];
const ledger = (b,title,amount,kind,day=state.day,method,reference) => state.ledger.push({id:id(),booking:b.id,title,amount,day,kind,method,reference});
function chargeNight(b,day) {
  if (b.start<=day && day<b.end && !state.ledger.some(x=>x.booking===b.id&&x.kind==='room'&&x.day===day)) ledger(b,'ليلة إقامة',nightlyCharge(b,day),'room',day);
}
function prepareCheckout(b) {
  for(let day=b.arrived || state.day; day<=state.day && day<b.end; day=addDays(day,1)) chargeNight(b,day);
}

let page = 'control';
let editing;
let query = '';
let toastTimer;
function notify(value) {
  $('toast').textContent=value;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>$('toast').textContent='',3500);
}
function save(label) {
  state.audit.unshift({at:new Date().toISOString(),day:state.day,label});
  localStorage.setItem(chosenKey(),JSON.stringify(state));
  render();
  notify(label);
}

function kpis() {
  const {sold,available}=operatingInventory();
  const roomEntries = state.ledger.filter(x=>x.day===state.day&&x.kind==='room');
  const revenue = roomEntries.reduce((sum,x)=>sum+x.amount,0);
  return {sold,available,revenue,occ:available?Math.round(sold/available*100):0, nights:roomEntries.length};
}
function matches(record) {
  return Object.values(record).join(' ').toLowerCase().includes(query.toLowerCase());
}
function roomView() {
  const inventory=operatingInventory();
  return controlCards([['غرف في المخزون',pn(state.rooms.length)],['غرف يشغلها مقيمون',pn(inventory.physical)],['حجوزات لليلة',pn(inventory.stays.length)],['متبقية للبيع',pn(inventory.free.length)]])+'<div class="room-grid">'+state.rooms.filter(r=>matches(r)).map(r=>'<div class="card"><strong>'+r.id+'</strong><span>'+r.type+' · '+(occupied(r.id)?'مشغولة':'شاغرة')+'</span><span>'+r.clean+'</span>'+badge(blocked(r.id)?'محجوبة':inventory.held.has(r.id)?'محجوزة الليلة':'متاحة الليلة',blocked(r.id))+'</div>').join('')+'</div>';
}
function bookingsView() {
  const visible=state.bookings.filter(b=>matches(b)&&(page!=='reception'||b.status==='مقيم'||b.status==='مؤكد'&&b.start<=state.day||b.departedDay===state.day));
  return bookingOperations(page)+table(['المرجع','الضيف','الغرفة','الوصول','المغادرة','قناة البيع','الفعالية','السعر المتوسط','الحالة','الإجراء'],visible.map(b=>[
    esc(b.id.slice(0,8)),esc(b.guest),esc(b.room),esc(b.start),esc(b.end),esc(b.source),esc(state.events.find(e=>e.id===b.eventId)?.title||'حجز مستقل'),pm(b.rate),badge(b.status)+(b.status==='مؤكد'&&blocked(b.room)?badge('بحاجة إلى إعادة تخصيص',true):''),
    (page==='reception'
      ? (b.status==='مؤكد'?action('checkin','تسجيل الوصول',b.id)+(b.start<=state.day?action('no-show','عدم حضور',b.id):''):b.status==='مقيم'?action('checkout','تسجيل المغادرة',b.id):'')
      : (b.status==='مؤكد'?action('edit','تعديل',b.id)+action('cancel','إلغاء',b.id):''))+action('account','الحساب',b.id)
  ]));
}
function cleaningView() {
  const inventory=operatingInventory();
  return controlCards([['وصول معلق',pn(inventory.due.length)],['تجهيز مطلوب',pn(state.rooms.filter(r=>r.clean==='تحتاج تنظيف').length)],['بانتظار الفحص',pn(state.rooms.filter(r=>r.clean==='بانتظار الفحص').length)]])+table(['الغرفة','الإقامة','النظافة','الإجراء'],state.rooms.filter(matches).sort((a,b)=>(a.clean==='جاهزة')-(b.clean==='جاهزة')).map(r=>[r.id,(occupied(r.id)?'مشغولة':'شاغرة')+(inventory.due.some(b=>b.room===r.id)?' · وصول معلق':''),badge(r.clean,r.clean!=='جاهزة'),r.clean==='تحتاج تنظيف'?action('clean','تم التنظيف',r.id):r.clean==='بانتظار الفحص'?action('inspect','اعتماد الجاهزية',r.id)+action('rework','إعادة التنظيف',r.id):action('rework','طلب تنظيف',r.id)]));
}
let accountId = '';
function folioView() {
  const selected=booking(accountId);
  return '<label>حساب الإقامة<select id="account-select"><option value="">اختر إقامة</option>'+state.bookings.map(b=>'<option value="'+esc(b.id)+'" '+(b===selected?'selected':'')+'>' +esc(b.guest+' · '+b.room)+'</option>').join('')+'</select></label>'+
    (selected?row('الرصيد',fmt(balance(selected.id)))+
      (active(selected)?action('payment','تسجيل دفعة',selected.id):'')+
      (balance(selected.id)<0?controlAction('refund','رد الرصيد الدائن',selected.id):'')+
      (selected.status==='مقيم'?action('post','ترحيل الليالي المستحقة',selected.id):'')+
      table(['التاريخ','البند','الوسيلة','المرجع','المبلغ'],stayRows(selected.id).map(x=>[esc(x.day),esc(x.title),x.kind==='payment'?esc(cashMethods.find(([key])=>key===(x.method||'cash'))?.[1]||'دفعة'):'تحميل على الحساب',esc(x.reference||x.id.slice(0,12)),fmt(x.amount)])):'')+
    '<hr>'+row('تاريخ العمل',esc(state.day))+action('close-day','إقفال اليوم',state.day)+
    table(['الأيام المقفلة','قيود الغرف · العدد','كشف المطابقة','التحصيل المطابق'],state.closed.map(day=>{
      const snapshot=resources().closing[day];
      return [esc(day),num.format(state.ledger.filter(x=>x.day===day&&x.kind==='room').length),esc(snapshot?.count.note||'سجل إقفال سابق'),snapshot?fmt(total(Object.values(snapshot.expected))):'سجل سابق'];
    }));
}
function generic(name) {
  const fields=fieldsFor(name);
  return table(fields.map(f=>f[1]).concat(name==='maintenance'?['الحالة','الإجراء']:['الإجراء']),state[name].filter(matches).map(r=>fields.map(([key,,type])=>type==='money'?fmt(r[key]):(key==='booking'?(booking(r[key])?esc(booking(r[key]).guest+' · '+booking(r[key]).room):esc(r[key])):esc(r[key]))).concat(
    name==='maintenance'?[badge(r.status,r.status!=='مغلق'),r.status==='مفتوح'?action('repair','تسجيل الإصلاح',r.id):r.status==='بانتظار الفحص'?action('release','اعتماد الفحص',r.id)+action('reject','إعادة الإصلاح',r.id):'']:[name==='pos'?'مرحّل':action('edit','تعديل',r.id)]
  )));
}
function content() {
  if(page==='rooms') return roomView();
  if(page==='bookings'||page==='reception') return bookingsView();
  if(page==='housekeeping') return cleaningView();
  return generic(page);
}
function render() {
  $('nav').innerHTML=groups.map(([group,names])=>'<p>'+group+'</p>'+names.split(' ').map(name=>'<button data-do="go" data-id="'+name+'" '+(page===name?'aria-current="page"':'')+'>'+modules[name][0]+'</button>').join('')).join('');
  if(page==='dashboard') { $('view').innerHTML=operatingDashboard(); return; }
  if(page==='control') { $('view').innerHTML=adminPage(); return; }
  if(page==='capitalSummary') { $('view').innerHTML=investmentPage(); return; }
  if(modelPages[page]) { $('view').innerHTML=renderBusiness(page); return; }
  if(page==='maintenance') { $('view').innerHTML=maintenancePage(); return; }
  if(resourceViews[page]) { $('view').innerHTML=renderResources(page); return; }
  if(page==='servicePlan') { $('view').innerHTML=renderSalesCatalog(); return; }
  if(salesViews[page]) { $('view').innerHTML=renderSales(page); return; }
  if(planningViews[page]) { $('view').innerHTML=renderPlanning(page); return; }
  const [label,description,schema]=modules[page];
  $('view').innerHTML='<div class="heading"><div><h1>'+label+'</h1><p class="muted">'+description+'</p></div>'+(schema?action('new',page==='bookings'?'حجز جديد':'إضافة سجل','','primary'):'')+'</div>'+
    '<section class="panel">'+(!['folio','reports'].includes(page)?'<div class="toolbar"><input id="search" type="search" aria-label="بحث في السجلات" placeholder="بحث في السجلات" value="'+esc(query)+'"></div>':'')+'<div id="results">'+content()+'</div></section>';
}
function openForm(name,record={}) {
  task=undefined;
  editing={name,record};
  $('dialog-title').textContent=name==='payment'?'تسجيل دفعة':modules[name][0];
  const fields=name==='payment'?[['amount','مبلغ الدفعة','money'],['method','وسيلة الدفع'],['reference','مرجع إيصال الدفع']]:fieldsFor(name);
  $('fields').innerHTML=fields.map(([key,label,type='text'])=>{
    let input;
    const optional=['rate','eventId','factor','preference','issue','receipt','invoice','training','evidence','reference','beo','equipment'].includes(key);
    if(name==='bookings'&&key==='eventId') return choose(key,label,[['','حجز مستقل'],...state.events.filter(e=>e.status==='مؤكد'||e.id===record.eventId).map(e=>[e.id,e.title])],record.eventId||'').replace(' required','');
    if(name==='bookings'&&key==='source') return choose(key,label,segments.map(s=>[s.key,s.label]),record.segment||classifySource(record.source));
    if(name==='rates'&&key==='type') return choose(key,label,roomTypes().map(x=>[x,x]),record[key]);
    if(name==='rates'&&key==='status') return choose(key,label,['مسودة','معتمد','موقوف'].map(x=>[x,x]),record[key]||'مسودة');
    if(name==='channels'&&key==='status') return choose(key,label,['مسودة','معتمد','موقوف','بيئة محلية','سجل تجريبي','تعاقد تجريبي'].map(x=>[x,x]),record[key]||'مسودة');
    if(name==='events'&&key==='hall') return choose(key,label,venueSpaces().map(([x,n])=>[x,x+' · '+pn(n)+' مقعد']),record[key]);
    if(name==='resort'&&key==='resource') return choose(key,label,resortSpaces.map(([x,n])=>[x,x+' · '+pn(n)+' مشارك']),record[key]);
    if(['events','resort'].includes(name)&&key==='status') return choose(key,label,['مؤكد','معلق','منفذ','ملغى'].map(x=>[x,x]),record[key]||'مؤكد');
    if(key==='method') return choose(key,label,cashMethods,'cash');
    if(key==='room'||key==='booking'||key==='outlet') {
      const options=key==='room'?state.rooms.map(r=>[r.id,r.id+' · '+r.type]):key==='booking'?state.bookings.filter(b=>b.status==='مقيم').map(b=>[b.id,b.guest+' · '+b.room]):outletNames().map(x=>[x,x]);
      input='<select name="'+key+'" required><option value="">اختر</option>'+options.map(([value,text])=>'<option value="'+esc(value)+'" '+(value===record[key]?'selected':'')+'>'+esc(text)+'</option>').join('')+'</select>';
    } else {
      const numeric=type==='money'||type==='number';
      const value=(name==='bookings'&&key==='rate'&&record.nightlyRates?'':record[key])??(type==='date'?(key==='end'?addDays(state.day,1):state.day):'');
      input='<input name="'+key+'" type="'+(numeric?'number':type)+'" '+(optional?'':'required')+(numeric?' min="0" step="1"':'')+' value="'+esc(value)+'">';
    }
    return '<label>'+label+input+'</label>';
  }).join('')+(name==='bookings'?'<div class="panel" id="room-price-preview"></div>':'');
  if(name==='bookings') roomPricePreview();
  $('error').textContent='';
  $('dialog').showModal();
}
function verify(condition,message) {
  if(!condition) throw new Error(message);
}
$('record-form').addEventListener('submit',event=>{
  if(processControl(event)) return;
  event.preventDefault();
  const {name,record}=editing;
  const data=Object.fromEntries(new FormData(event.target));
  for(const [field,,type] of fieldsFor(name)) if(field!=='rate'&&(type==='number'||type==='money')) data[field]=Number(data[field]);
  try {
    if(data.start&&data.end) verify(data.end>data.start,'يجب أن تكون النهاية بعد البداية.');
    if(name==='payment') {
      const b=booking(record.id);
      verify(b&&active(b)&&Number(data.amount)>0,'أدخل مبلغًا موجبًا لإقامة نشطة.');
      verify(positive(data.amount)&&cashMethods.some(([value])=>value===data.method),'تحقق من المبلغ وطريقة الدفع.');
      const receipt=data.reference.trim();
      verify(receipt&&!referenceUsed(receipt),'أدخل مرجع دفع غير مستخدم.');
      ledger(b,'دفعة حساب',-Number(data.amount),'payment',state.day,data.method,receipt);
    } else {
      if(name==='bookings') {
        verify(data.start>=state.day,'تاريخ الوصول يسبق يوم العمل.');
        verify(!blocked(data.room),'الغرفة محجوبة للصيانة.');
        verify(!state.bookings.some(b=>b.id!==record.id&&active(b)&&b.room===data.room&&overlap(b,data)),'توجد إقامة متداخلة لهذه الغرفة.');
        if(data.eventId){
          const event=state.events.find(x=>x.id===data.eventId&&x.status==='مؤكد');
          verify(event&&data.start<=event.start.slice(0,10)&&event.start.slice(0,10)<data.end,'تأكد أن الإقامة تشمل تاريخ الفعالية المؤكدة.');
          verify(state.bookings.filter(x=>x.id!==record.id&&x.eventId===event.id&&active(x)).length<event.rooms,'حصة الغرف المرتبطة بالفعالية ممتلئة.');
        }
        prepareReservationPrice(data,record);
        data.status='مؤكد';
      }
      if(name==='maintenance') {
        verify(!blocked(data.room),'يوجد بلاغ مفتوح لهذه الغرفة.');
        data.status='مفتوح';
      }
      if(name==='rates') {
        verify(roomTypes().includes(data.type)&&positive(data.amount)&&positive(data.min),'أدخل نوع غرفة وسعرًا وحد إقامة صالحًا.');
        verify(data.status!=='معتمد'||!state.rates.some(x=>x.id!==record.id&&x.type===data.type&&x.status==='معتمد'&&overlap(x,data)),'يوجد استثناء معتمد متداخل للنوع نفسه.');
      }
      if(name==='channels') {
        verify((!data.factor||data.factor>=25&&data.factor<=400)&&data.commission>=0&&data.commission<=100&&!state.channels.some(x=>x.id!==record.id&&x.mapping===data.mapping),'تحقق من العمولة وتفرّد رمز القناة.');
      }
      if(name==='guests'&&data.issue!==record.issue) data.serviceState=data.issue?'مفتوح':'مسجل';
      if(name==='events'||name==='resort') {
        const keys=name==='events'?['hall']:['resource','staff','equipment'];
        if(name==='events') {
          verify(data.rooms>=0&&data.rooms<=state.rooms.length,'حصة الغرف تتجاوز المخزون.');
          const linked=state.bookings.filter(x=>record.id&&x.eventId===record.id&&active(x));
          const eventDay=data.start.slice(0,10);
          verify(!linked.length||(data.status==='مؤكد'&&linked.length<=data.rooms&&linked.every(x=>x.start<=eventDay&&eventDay<x.end)),'راجع الحجوزات المرتبطة قبل تغيير تاريخ الفعالية أو حالتها أو حصتها.');
        }
        if(name==='resort') verify(positive(data.capacity)&&data.capacity<=resortSpaces.find(x=>x[0]===data.resource)?.[1],'عدد المشاركين يتجاوز سعة المرفق.');
        if(!['ملغى','منفذ'].includes(data.status)) verify(!state[name].some(r=>!['ملغى','منفذ'].includes(r.status)&&r.id!==record.id&&overlap(r,data)&&keys.some(key=>data[key]&&data[key]===r[key])),'أحد الموارد محجوز في الفترة نفسها.');
      }
      if(name==='pos') {
        const b=booking(data.booking);
        verify(b?.status==='مقيم'&&data.amount>0,'اختر إقامة نشطة وأدخل مبلغًا موجبًا.');
        ledger(b,data.outlet+' · '+data.title,data.amount,'pos');
      }
      if(record.id) Object.assign(record,data);
      else state[name].push({...data,id:id()});
    }
    $('dialog').close();
    save(name==='payment'?'تم تسجيل الدفعة':name==='bookings'?'تم حفظ الحجز':'تم حفظ السجل');
  } catch(error) { $('error').textContent=error.message; }
});

function switchPage(value) {
  page=value;
  query='';
  controlFilter='';
  $('sidebar').classList.remove('open');
  $('menu').setAttribute('aria-expanded','false');
  render();
  window.scrollTo(0,0);
}
document.addEventListener('input',e=>{
  if(e.target.id==='search') {query=e.target.value; $('results').innerHTML=content();}
});
document.addEventListener('change',e=>{
  if(e.target.id==='account-select') {accountId=e.target.value; $('ops-results').innerHTML=cashierControl(); $('account-select').focus();}
});
document.addEventListener('click',e=>{
  const button=e.target.closest('[data-do]');
  if(!button) return;
  const operation=button.dataset.do;
  const target=button.dataset.id;
  try {
    switch(operation) {
      case 'go': switchPage(target); return;
      case 'new': openForm(page); return;
      case 'edit': openForm(page,state[page].find(x=>x.id===target)); return;
      case 'payment': openForm('payment',{id:target}); return;
      case 'account': accountId=target; switchPage('folio'); return;
      case 'cancel':
        verify(balance(target)===0,'الحساب يحتاج إلى تسوية قبل الإلغاء.');
        if(!confirm('إلغاء هذا الحجز؟')) return;
        booking(target).status='ملغى';
        break;
      case 'no-show':
        verify(balance(target)===0,'الحساب يحتاج إلى تسوية قبل إثبات عدم الحضور.');
        if(!confirm('تسجيل عدم حضور الضيف؟')) return;
        booking(target).status='لم يحضر';
        break;
      case 'checkin': {
        const b=booking(target);
        verify(b.start<=state.day&&b.end>state.day,'يوم العمل خارج مدة الحجز.');
        verify(!blocked(b.room)&&!occupied(b.room)&&room(b.room).clean==='جاهزة','الغرفة غير جاهزة للتسكين.');
        b.status='مقيم';
        b.arrived=state.day;
        break;
      }
      case 'post': prepareCheckout(booking(target)); break;
      case 'checkout': {
        const b=booking(target);
        prepareCheckout(b);
        if(balance(target)!==0) {
          save('تم تحديث الرسوم المستحقة');
          accountId=target;
          switchPage('folio');
          notify('سوِّ الرصيد قبل تسجيل المغادرة.');
          return;
        }
        b.status='غادر';
        b.departedDay=state.day;
        room(b.room).clean='تحتاج تنظيف';
        break;
      }
      case 'clean': room(target).clean='بانتظار الفحص'; break;
      case 'inspect': room(target).clean='جاهزة'; break;
      case 'rework': room(target).clean='تحتاج تنظيف'; break;
      case 'repair': state.maintenance.find(m=>m.id===target).status='بانتظار الفحص'; break;
      case 'reject': state.maintenance.find(m=>m.id===target).status='مفتوح'; break;
      case 'release': state.maintenance.find(m=>m.id===target).status='مغلق'; break;
      case 'close-day': {
        permit('مالية');
        verify(target===state.day&&!state.closed.includes(target),'سبق إقفال هذا اليوم.');
        verify(!state.bookings.some(b=>b.status==='مقيم'&&b.end<=target),'توجد مغادرات مستحقة تحتاج إلى معالجة.');
        verify(!state.bookings.some(b=>b.status==='مؤكد'&&b.start<=target),'راجع حجوزات الوصول المعلقة قبل الإقفال.');
        const closing=closeGate(target);
        if(!confirm('إقفال '+target+' وترحيل رسوم الليالي؟')) return;
        state.bookings.filter(b=>b.status==='مقيم').forEach(b=>chargeNight(b,target));
        resources().closing[target]={...closing,sold:new Set(state.ledger.filter(x=>x.day===target&&x.kind==='room'&&x.amount>0).map(x=>booking(x.booking)?.room||x.booking)).size};
        state.closed.unshift(target);
        state.day=addDays(target,1);
        break;
      }
    }
    save(button.textContent+' · تم التنفيذ');
  } catch(error) { notify(error.message); }
});
$('dismiss').onclick=()=>$('dialog').close();
$('dialog').addEventListener('close',()=>{task=undefined;});
$('menu').onclick=()=>{
  const open=$('sidebar').classList.toggle('open');
  $('menu').setAttribute('aria-expanded',String(open));
};
$('export').onclick=()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
  const link=document.createElement('a');
  link.href=url;
  link.download='iwan-'+state.day+'.json';
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
activateProperty();
window.addEventListener('storage',event=>{
 if(!event.newValue||![chosenKey(),planStorage,modelStorage].includes(event.key)) return;
 if($('dialog').open) $('dialog').close();
 if(event.key===chosenKey()) {state=JSON.parse(event.newValue);selectProperty();}
 else if(event.key===modelStorage) Object.assign(budgetInputs,JSON.parse(event.newValue));
 else {
  const old=preferences.scenario;
  Object.assign(preferences,JSON.parse(event.newValue));
  if(old!==preferences.scenario) activateProperty();
 }
 render();
});
render();
if('serviceWorker' in navigator && ['http:','https:'].includes(location.protocol)) navigator.serviceWorker.register('./sw.js').catch(console.warn);

