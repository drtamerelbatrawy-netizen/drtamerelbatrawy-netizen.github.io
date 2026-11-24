'use strict';

const controlPages = ['stock','folio','finance','staff','compliance','reports'];
const cashMethods = [['cash','نقد'],['card','بطاقة'],['bank','تحويل']];
const accountsForPayment={cash:'الصندوق',card:'بطاقات برسم التحصيل',bank:'البنك'};
const dutyRoles = ['تشغيل','مشتريات','استلام','مالية','رقابة','موارد بشرية'];
let controller = 'تشغيل';
let controlFilter = '';
let controlPeriod = 'day';
const catalog = [
 ['LIN','طقم بياضات غرف','المغسلة','طقم',95,'غرف',1,3,0,false],
 ['TOW','منشفة حمام','التدبير','قطعة',29,'غرف',2,4,0,false],
 ['KIT','مستلزمات الضيافة','التدبير','عبوة',8,'غرف',1,7,0,false],
 ['DET','منظف مغسلة','المغسلة','لتر',18,'غرف',0.25,7,0,false],
 ['BRK','مواد الإفطار','مطبخ بارد','حصة',19,'بوفيه إفطار',1,4,8,true],
 ['PRO','بروتين وقائمة يومية','مطبخ ساخن','حصة',34,'وجبة',1,3,5,true],
 ['COF','بن وأدوات تقديم','مقهى اللوبي','طلب',9,'قهوة وحلويات',1,10,45,true],
 ['WAT','عبوة مياه','مخزن الأغذية','عبوة',2,'غرف',2,10,180,true],
 ['SPA','زيوت ومستهلكات علاج','السبا','مجموعة',24,'جلسة تدليك',1,10,0,false],
 ['EVT','مستهلكات ضيافة فعالية','القاعات','حصة',16,'تقديم طعام للاجتماع',1,8,45,true],
 ['FLT','مرشح تكييف قياسي','الهندسة','قطعة',66,'غرف',0.04,15,0,false],
 ['PPE','أدوات حماية ونظافة','المخزن العام','طقم',15,'غرف',0.2,10,0,false],
 ['BED','حزمة مفرش وسرير احتياطية','التدبير','طقم',125,'غرف',0.08,14,0,false],
 ['BTH','مستهلكات الحمام','التدبير','حزمة',11,'غرف',1,7,0,false],
 ['PAP','مناديل وورق حمام','التدبير','عبوة',6,'غرف',2,7,0,false],
 ['DIS','معقم أسطح','المخزن العام','لتر',22,'غرف',0.2,7,0,false],
 ['VEG','خضروات وفاكهة','مطبخ بارد','حصة',10,'وجبة',1,2,4,true],
 ['BAK','معجنات ومخبوزات','مخبز','حصة',8,'بوفيه إفطار',1,2,3,true],
 ['JUI','مكونات عصائر','المشروبات','طلب',7,'عصائر ومشروبات باردة',1,3,10,true],
 ['MIN','مستلزمات الميني بار','مخزن الأغذية','طقم',22,'مشتريات الميني بار',1,7,90,true],
 ['BOX','عبوات تقديم ونقل','المطبخ','قطعة',4,'وجبة خفيفة',1,10,0,false],
 ['CLE','أقراص آلات غسيل الأواني','غسيل الأواني','عبوة',23,'وجبة',0.08,10,0,false],
 ['EVP','ورق وأدوات اجتماعات','القاعات','طقم',12,'تقديم طعام للاجتماع',1,10,0,false],
 ['THR','أغطية علاج أحادية الاستخدام','السبا','قطعة',6,'جلسة تدليك',1,7,0,false],
 ['SWT','حزمة مناشف المسبح','السبا','طقم',49,'دخول أساسي للمقيم',0.22,7,0,false],
 ['PTK','مستهلكات جهاز اختبار المياه','المسبح','حزمة',85,'دخول أساسي للمقيم',0.05,12,120,true],
 ['KID','مستهلكات ورش نادي الأطفال','الأنشطة','حزمة',11,'نادي الأطفال',1,10,0,false],
 ['KDS','بطاقات مفاتيح الغرف','الاستقبال','بطاقة',8,'غرف',0.25,10,0,false],
 ['POS','لفات طباعة الإيصالات','المخزن العام','لفة',5,'طلب',0.02,10,0,false],
 ['VAN','مستهلكات تجهيز رحلة نقل','النقل','طقم',8,'نقل المطار',1,7,0,false],
 ['GFT','تغليف منتجات التجزئة','التجزئة','عبوة',6,'هدايا ومستلزمات',1,10,0,false],
 ['BUL','مصباح وملحق كهربائي','الهندسة','قطعة',25,'غرف',0.04,14,0,false],
 ['PLM','طقم وصلات سباكة','الهندسة','طقم',45,'غرف',0.04,14,0,false]
];
const inspectionTemplates = [
 ['FOOD','مطابقة سجل سلامة الغذاء','الأغذية والمشروبات','توثيق نتيجة القياس وفق خطة سلامة الغذاء المعتمدة للموقع',1],
 ['ROOM','فحص غرف قبل التسليم','التدبير والمغسلة','مراجعة عينة غرف مقابل قائمة التجهيز والنظافة',1],
 ['POOL','جاهزية المسبح والإنقاذ','السبا والترفيه','توثيق فحص المعدات والقياسات وفق خطة المرفق',1],
 ['FIRE','مسارات الإخلاء وأبواب الطوارئ','الأمن والسلامة','تسجيل الجولة والملاحظات على المخارج',1],
 ['ENG','جولة محطات التشغيل','الهندسة وتقنية المعلومات','تأكيد جاهزية المحطات وإحالة العيوب إلى الصيانة',1],
 ['DATA','مراجعة الوصول إلى سجلات الضيوف','الموارد البشرية والجودة','مراجعة سجلات الاطلاع والصلاحيات وفق سياسة المنشأة',7],
 ['LIC','مراجعة سجل التراخيص والأدلة','الموارد البشرية والجودة','مطابقة سجل الوثائق ومواعيد التجديد مع الأصول',30]
];
const controlSales=()=>resources().sales??[];
const referenceUsed=ref=>state.ledger.some(x=>x.reference===ref)||controlSales().some(x=>x.ref===ref)||(resources().bankMoves||[]).some(x=>x.ref===ref);
const expenseCategories=['طاقة ومرافق','صيانة تعاقدية','توزيع وعمولات','إدارة وتسويق','تأمين وخدمات مساندة'];
const textOf=x=>String(x??'').trim();
const positive=x=>Number.isSafeInteger(Number(x))&&Number(x)>0;
const shortId=x=>esc(x.slice(0,12));
const dailyPlan = () => forecast(controlProfile(),0,daysInYear(preferences.year),{...preferences});
const controlProfile = () => profile();
const workDays = (start,end) => Math.round((Date.parse(end)-Date.parse(start))/86400000);
const fmtControl = (key,value) => '<span class="badge '+(key?'warning':'')+'">'+esc(value)+'</span>';
const startMonth = day => day.slice(0,7)+'-01';
function periodBounds(day, period) {
 const year=Number(day.slice(0,4)), month=Number(day.slice(5,7));
 if(period==='year') return [year+'-01-01',(year+1)+'-01-01'];
 if(period==='month') return [startMonth(day),addDays(startMonth(day),daysInMonth(year,month))];
 return [day,addDays(day,1)];
}
function inventoryPlan() {
 const p=controlProfile(), f=dailyPlan(), target=p.keys*preferences.occupancy/100;
 return catalog.map(([sku,name,store,unit,base,driver,ratio,lead,shelf,perishable])=>{
  const related=f.services.filter(x=>x.name===driver||x.unit===driver);
  const demand=Math.max(1,Math.ceil((driver==='غرف'?target:total(related,x=>x.quantity)/f.days)*ratio));
  return {sku,name,store,unit,price:Math.max(1,Math.round(base*preferences.costIndex/100)),demand,lead,shelf,perishable,min:demand*Math.min(lead,shelf||lead),max:demand*Math.min(lead+3,shelf||lead+3)};
 });
}
function resources() {
 if(state.resources) {
  if(state.resources.catalogSize!==catalog.length) {
   const known=new Set(state.resources.lots.map(x=>x.sku));
   for(const item of inventoryPlan().filter(x=>!known.has(x.sku))) {
    state.resources.lots.push({id:'OPEN-'+item.sku,sku:item.sku,quantity:item.min,price:item.price,expiry:item.shelf?addDays(state.day,item.shelf):'',received:state.day});
   }
   state.resources.catalogSize=catalog.length;
  }
  return state.resources;
 }
 const opened=state.day, items=inventoryPlan();
 const lots=items.map((x,i)=>({id:'OPEN-'+x.sku,sku:x.sku,quantity:x.demand*(i%4===0?1:Math.min(x.lead+2,x.shelf||x.lead+2)),price:x.price,expiry:x.shelf?addDays(opened,x.shelf):'',received:opened}));
 state.resources={catalogSize:catalog.length,lots,orders:[],movements:[],counts:{},checks:[],incidents:[],attendance:{},payroll:[],closing:{},sales:[]};
 state.resources.orders.push({id:'PO-DEMO-01',sku:'BRK',qty:items.find(x=>x.sku==='BRK').demand*2,price:items.find(x=>x.sku==='BRK').price,vendor:'مورد الأغذية التجريبي',day:opened,status:'معتمد'});
 for(const check of inspectionTemplates.slice(0,3)){
  const [code]=check;
  if(code==='ROOM') continue;
  state.resources.checks.push({code,day:opened,result:'مطابق',note:'تسجيل افتتاحي تجريبي لوردية الصباح'});
 }
 state.resources.incidents.push({id:'CAPA-DEMO',code:'ROOM',day:opened,due:addDays(opened,1),note:'مستلزمات ناقصة في عينة من الغرف',status:'مفتوح'});
 const demo=items.find(x=>x.sku==='KIT');
 consume(demo.sku,Math.min(demo.demand,stockBalance(demo.sku)),'صرف','صرف افتتاحي تجريبي للتدبير');
 return state.resources;
}
const stockItem=sku=>inventoryPlan().find(x=>x.sku===sku);
const usableLots=(sku,day=state.day)=>resources().lots.filter(x=>x.sku===sku&&x.quantity>0&&(!x.expiry||x.expiry>=day)).sort((a,b)=>(a.expiry||'9999').localeCompare(b.expiry||'9999')||a.received.localeCompare(b.received));
const stockBalance=sku=>total(usableLots(sku),x=>x.quantity);
const bill=o=>o.received*o.price;
const ordersOpen=sku=>resources().orders.filter(o=>o.sku===sku&&['طلب','معتمد'].includes(o.status));
const permit=role=>verify(controller===role,'اختر دور '+role+' لتنفيذ الإجراء في المحاكاة.');
function controlCards(cards) {return '<div class="cards">'+cards.map(([label,value])=>card(label,value)).join('')+'</div>';}
function choose(name,label,options,current='') {
 return '<label>'+label+'<select name="'+name+'" required>'+options.map(([key,value])=>'<option value="'+esc(key)+'" '+(key===current?'selected':'')+'>'+esc(value)+'</option>').join('')+'</select></label>';
}
function controlInput(name,label,type='text',value='',min=1) {
 return '<label>'+label+'<input name="'+name+'" type="'+type+'" value="'+esc(value)+'" '+(type==='number'?'min="'+min+'" step="1" ':'')+'required></label>';
}
const controlAction=(operation,label,target='')=>'<button class="action" type="button" data-control="'+operation+'" data-ref="'+esc(target)+'">'+label+'</button>';
const matchesControl=x=>textOf(x).toLowerCase().includes(controlFilter.toLowerCase());
function stockControl() {
 const r=resources(), items=inventoryPlan();
 const below=items.filter(x=>stockBalance(x.sku)<x.min).length;
 const value=total(r.lots,x=>x.price*x.quantity);
 const found=items.filter(x=>matchesControl([x.sku,x.name,x.store].join(' ')));
 return controlCards([['أصناف تحت حد الطلب',pn(below)],['أوامر تنتظر الاستلام',pn(r.orders.filter(x=>x.status==='معتمد').length)],['قيمة المخزون الدفترية',pm(value)]])+
 displaySection('الرصيد والاستهلاك عند الإشغال المخطط',['الصنف والمخزن','وحدة القياس','رصيد صالح','طلب يومي','نقطة إعادة الطلب','كمية مقترحة','الإجراء'],found.map(x=>{
   const qty=stockBalance(x.sku), inbound=total(ordersOpen(x.sku),o=>o.qty);
   return [esc(x.name+' · '+x.store),x.unit,pn(qty),pn(x.demand),pn(x.min),pn(Math.max(0,x.max-qty-inbound)),
    controlAction('request','طلب شراء',x.sku)+controlAction('issue','صرف',x.sku)+controlAction('count','جرد',x.sku)];
 }))+
 displaySection('طلبات الشراء والاستلام ومطابقة الفاتورة',['المرجع','المورد','الصنف','المطلوب','سعر الوحدة','المستلم','فاتورة المورد','الحالة','الإجراء'],r.orders.map(o=>[
   shortId(o.id),esc(o.vendor),esc(stockItem(o.sku).name),pn(o.qty),pm(o.price),o.received?pn(o.received):'بانتظار الاستلام',esc(o.invoice||'بانتظار الفاتورة'),badge(o.status),
   o.status==='طلب'?controlAction('approve','اعتماد',o.id):o.status==='معتمد'?controlAction('receive','استلام',o.id):o.status==='مستلم'?controlAction('match','مطابقة الفاتورة',o.id):o.status==='مطابق'?controlAction('supplierPay','سداد المورد',o.id):'مكتمل'
 ]))+
 displaySection('دفعات المخزون والصلاحية',['الدفعة','الصنف','المتبقي','آخر يوم استخدام','الحالة'],r.lots.filter(x=>x.quantity>0&&matchesControl([stockItem(x.sku).name,stockItem(x.sku).store,x.sku].join(' '))).map(x=>[
  shortId(x.id),esc(stockItem(x.sku).name),pn(x.quantity),esc(x.expiry||'غير مؤرخ'),x.expiry&&x.expiry<state.day?badge('منتهي',true)+controlAction('waste','إتلاف الدفعة',x.id):badge('متاح')
 ]))+
 displaySection('حركات الصرف والجرد والاستلام',['اليوم','الصنف','الحركة','الكمية','التكلفة','مرجع الحركة'],r.movements.slice().reverse().map(m=>[esc(m.day),esc(stockItem(m.sku).name),esc(m.kind),pn(m.quantity),pm(m.amount),esc(m.note)]));
}
function cashTotals(day) {
 const payment=state.ledger.filter(x=>x.day===day&&x.kind==='payment');
 return Object.fromEntries(cashMethods.map(([key])=>[key,
  total(controlSales().filter(x=>x.day===day&&x.method===key),x=>x.amount)-total(payment.filter(x=>(x.method||'cash')===key),x=>x.amount)]));
}
function closeGate(day) {
 const expected=cashTotals(day), count=resources().counts[day];
 verify(count&&cashMethods.every(([key])=>count[key]===expected[key]),'طابق النقد والبطاقات والتحويلات مع كشف التحصيل الحالي قبل الإقفال.');
 return {expected,count:{...count},rooms:operatingInventory(day).available,occupancy:operatingInventory(day).physical};
}
function cashierControl() {
 const x=cashTotals(state.day), c=resources().counts[state.day];
 const open=state.bookings.filter(b=>active(b));
 const resident=open.filter(b=>b.status==='مقيم');
 return controlCards([['حسابات نشطة',pn(open.length)],['تحصيل يوم العمل',pm(total(Object.values(x)))],['صافي أرصدة المقيمين',pm(total(resident,b=>balance(b.id)))]])+
 panel('حساب الضيف والإقفال',folioView())+
 displaySection('مطابقة الصندوق والتحصيل الإلكتروني',['وسيلة الدفع','دفتر النظام','الجرد أو كشف البنك','الفرق'],cashMethods.map(([key,label])=>[
  label,pm(x[key]),c?pm(c[key]):'بانتظار التسجيل',c?pm(c[key]-x[key]):'بانتظار المطابقة'
 ]))+controlAction('cashCount','تسجيل الجرد والمطابقة')+controlAction('serviceSale','تسجيل بيع خدمة من الكتالوج')+
 displaySection('مبيعات الخدمات المثبتة',['اليوم','الخدمة','الوحدات','السعر','المبلغ','التحصيل','المستند'],controlSales().slice().reverse().map(x=>[esc(x.day),esc(x.name),pn(x.qty),pm(x.price),pm(x.amount),esc(x.booking?'على حساب الغرفة':cashMethods.find(([key])=>key===x.method)[1]),esc(x.ref)]))+
 displaySection('الحسابات المفتوحة والأرصدة',['الحجز','الغرفة','الحالة','إجمالي الرسوم','التحصيل','الرصيد','الإجراء'],open.filter(b=>matchesControl([b.guest,b.room,b.id].join(' '))).map(b=>{
  const entries=stayRows(b.id);
  return [esc(b.guest),esc(b.room),badge(b.status),pm(total(entries.filter(x=>x.kind!=='payment'),x=>x.amount)),pm(-total(entries.filter(x=>x.kind==='payment'),x=>x.amount)),pm(balance(b.id)),action('account','فتح الحساب',b.id)];
 }));
}
function journal(start,end) {
 const inPeriod=day=>day>=start&&day<end;
 const rows=[];
 const add=(day,ref,debit,credit,amount)=>{if(amount>0) rows.push({day,ref,debit,credit,amount});};
 for(const x of state.ledger.filter(x=>inPeriod(x.day))){
  if(x.kind==='payment') {
   const channel=accountsForPayment[x.method||'cash'];
   if(x.amount<0) add(x.day,x.id,channel,'حسابات الضيوف',-x.amount);
   else add(x.day,x.id,'حسابات الضيوف',channel,x.amount);
  }
  else add(x.day,x.id,'حسابات الضيوف',x.kind==='room'?'إيراد الإقامة':x.kind==='service'?'إيراد الخدمات':'إيراد المطاعم',x.amount);
 }
 for(const sale of controlSales().filter(x=>!x.booking&&inPeriod(x.day))) {
  add(sale.day,sale.ref,accountsForPayment[sale.method],'إيراد الخدمات',sale.amount);
 }
 for(const o of resources().orders){
  if(o.receivedDay&&inPeriod(o.receivedDay)) add(o.receivedDay,o.id,'المخزون','استلامات غير مفوترة',bill(o));
  if(o.matchedDay&&inPeriod(o.matchedDay)) add(o.matchedDay,o.invoice,'استلامات غير مفوترة','الموردون',bill(o));
  if(o.paidDay&&inPeriod(o.paidDay)) add(o.paidDay,o.paidRef,'الموردون','البنك',bill(o));
 }
 for(const x of resources().movements.filter(x=>inPeriod(x.day)&&['صرف','عجز','زيادة','إتلاف'].includes(x.kind))) {
  add(x.day,x.id,x.kind==='زيادة'?'المخزون':x.kind==='صرف'?'تكلفة صرف مخزون':'فروق وإتلاف مخزون',x.kind==='زيادة'?'فروق وإتلاف مخزون':'المخزون',x.amount);
 }
 for(const payroll of resources().payroll.filter(x=>inPeriod(x.day))) add(payroll.day,'PAY-'+payroll.month,'مصروف رواتب وتعويضات','رواتب مستحقة',payroll.amount);
 for(const move of (resources().bankMoves||[]).filter(x=>inPeriod(x.day))) {
  if(move.kind==='settlement') add(move.day,move.ref,'البنك','بطاقات برسم التحصيل',move.amount);
  else add(move.day,move.ref,'مصروف '+move.title,'البنك',move.amount);
 }
 return rows;
}
function cardExposure() {
 const journalRows=journal('1900-01-01',addDays(state.day,1));
 return total(journalRows.filter(x=>x.debit==='بطاقات برسم التحصيل'),x=>x.amount)-total(journalRows.filter(x=>x.credit==='بطاقات برسم التحصيل'),x=>x.amount);
}
function budgetFor(start,end) {
 const year=Number(start.slice(0,4));
 // Limit the comparison to elapsed operating dates, using the same assumptions as the study.
 const dates=periodBounds(start,'year');
 const offset=workDays(dates[0],start);
 return forecast(controlProfile(),offset,workDays(start,end),{...preferences,year});
}
function financeControl() {
 const [start,end]=periodBounds(state.day,controlPeriod);
 const through=addDays(state.day,1)<end?addDays(state.day,1):end;
 const period=journal(start,through);
 const cardOpen=cardExposure();
 const accounts=[...new Set(period.flatMap(x=>[x.debit,x.credit]))];
 const owed=resources().orders.filter(o=>o.status==='مطابق');
 const pending=resources().orders.filter(o=>o.status==='مستلم');
 const b=budgetFor(start,through);
 const operating=operationsSummary(start,through);
 const journalExpenses=total(period.filter(x=>x.debit.startsWith('مصروف')||x.debit.startsWith('تكلفة')||x.debit.startsWith('فروق')),x=>x.amount)-total(period.filter(x=>x.credit.startsWith('فروق')),x=>x.amount);
 return controlCards([['موردون مستحقون',pm(total(owed,bill))],['استلامات غير مفوترة',pm(total(pending,bill))],['أرصدة حسابات الضيوف',pm(total(state.bookings,b=>balance(b.id)))],['بطاقات برسم التحصيل',pm(cardOpen)]])+
 displaySection('المتابعة المالية للفترة حتى يوم العمل',['البند','المرحّل من التشغيل','موازنة الفترة المنقضية','الفرق'],[
  ['إيراد الإقامة',operating.room,b.roomRevenue],['إيراد الخدمات',operating.pos,b.serviceRevenue],
  ['إجمالي الإيراد',operating.room+operating.pos,b.revenue],['مصروفات التشغيل المقيدة',journalExpenses,b.operating],['صافي العمليات المقيدة',operating.room+operating.pos-journalExpenses,b.gop]
 ].map(([name,actual,target])=>[name,pm(actual),pm(target),pm(actual-target)]))+
 panel('البنك والمصروفات المستندية',controlAction('cardPayout','تسجيل تسوية البطاقات')+controlAction('expense','إثبات مصروف بنكي')+
 table(['التاريخ','العملية','المرجع البنكي','المبلغ'],(resources().bankMoves||[]).slice().reverse().map(x=>[esc(x.day),esc(x.title),esc(x.ref),pm(x.amount)])))+
 displaySection('ذمم الموردين وتسوياتها',['أمر الشراء','المورد','رقم فاتورة المورد','تاريخ الاستحقاق','المبلغ','الإجراء'],owed.map(o=>[
  shortId(o.id),esc(o.vendor),esc(o.invoice),esc(o.due),pm(bill(o)),o.due<state.day?badge('متأخر',true)+controlAction('supplierPay','تسجيل السداد',o.id):controlAction('supplierPay','تسجيل السداد',o.id)
 ]))+
 displaySection('أرصدة حركة القيود للفترة',['الحساب','مدين','دائن','صافي الحركة'],accounts.map(name=>{
  const debit=total(period.filter(x=>x.debit===name),x=>x.amount), credit=total(period.filter(x=>x.credit===name),x=>x.amount);
  return [name,pm(debit),pm(credit),pm(debit-credit)];
 }))+
 displaySection('دفتر القيود من المستندات المصدرية',['التاريخ','المرجع','مدين','دائن','القيمة'],period.slice().reverse().map(x=>[esc(x.day),shortId(x.ref),x.debit,x.credit,pm(x.amount)]))+
 '<p class="muted">يعرض الدفتر حركة القيود المتولدة من هذه البيئة. تبدأ أرصدة المخزون الافتتاحية في سجل الجرد، وتستبعد النتائج مصروفات التشغيل التي لم تُسجّل بعد.</p>';
}

const shifts=['صباحية','مسائية','ليلية'];
const continuous=new Set(['الاستقبال والحجز','التدبير والمغسلة','الأغذية والمشروبات','الهندسة وتقنية المعلومات','الأمن والسلامة','المطابخ']);
function roster(day=state.day) {
 const p=controlProfile();
 const rotation=Math.floor(Date.parse(day)/86400000);
 return staffing(p).flatMap((position,i)=>Array.from({length:position.count},(_,j)=>{
  const number='EMP-'+String(i+1).padStart(2,'0')+'-'+String(j+1).padStart(2,'0');
  const slot=((rotation%7)+i+j)%7;
  const shift=slot>=5?'راحة':continuous.has(position.department)?shifts[(i+j+Math.floor(rotation/7))%3]:'صباحية';
  return {...position,number,shift:resources().attendance[day]?.[number]?.shift||shift,scheduled:shift};
 }));
}
function workload() {
 const work=workloadTargets(controlProfile()), rooms=state.bookings.filter(b=>b.status==='مقيم').length;
 const expected=Math.round(state.rooms.length*preferences.occupancy/100);
 const roomsToClean=state.rooms.filter(r=>r.clean!=='جاهزة').length;
 const arrivals=state.bookings.filter(b=>b.status==='مؤكد'&&b.start<=state.day).length;
 const departures=state.bookings.filter(b=>b.status==='مقيم'&&b.end<=state.day).length;
 const outlets=work.covers;
 return [
  ['الاستقبال والحجز','وصول ومغادرة مستحقة',arrivals+departures,Math.ceil(work.reception*5/7)],
  ['التدبير والمغسلة','غرف مقيمة + تجهيز وفحص',rooms+roomsToClean,Math.max(Math.ceil(work.attendants*5/7),Math.ceil((Math.max(expected,rooms)+roomsToClean)/14))],
  ['الأغذية والمشروبات','طلبات وضيافة متوقعة يوميًا',Math.round(outlets),Math.ceil(work.waiters*5/7)],
  ['المطابخ','وجبات وتغطيات إنتاج يومية',Math.round(outlets),Math.ceil(work.cooks*5/7)],
  ['الأمن والسلامة','مواقع تغطية طوال اليوم',3,3],
  ['المبيعات والإيرادات','فعاليات مدرجة لتاريخ اليوم',state.events.filter(x=>x.start.slice(0,10)<=state.day&&x.end.slice(0,10)>=state.day&&x.status==='مؤكد').length,1],
  ['السبا والترفيه','مواعيد أنشطة مؤكدة اليوم',state.resort.filter(x=>x.start.slice(0,10)<=state.day&&x.end.slice(0,10)>=state.day&&x.status==='مؤكد').length,2],
  ['الهندسة وتقنية المعلومات','بلاغات صيانة مفتوحة',state.maintenance.filter(x=>x.status!=='مغلق').length,3]
 ];
}
function staffControl() {
 const people=roster();
 const wage=total(people,x=>x.person);
 const working=people.filter(x=>shifts.includes(x.shift));
 const attendance=resources().attendance[state.day]||{};
 const filtered=people.filter(x=>matchesControl([x.number,x.department,x.title,x.shift].join(' ')));
 const coverage=workload();
 return controlCards([['العاملون في الملاك',pn(people.length)],['مجدولون اليوم',pn(working.length)],['استثناءات الوردية المسجلة',pn(Object.keys(attendance).length)],['التعويض الشهري المخطط',pm(wage)]])+
 displaySection('حمل التشغيل وتغطية الورديات',['القسم','محرك الطلب','الحجم','احتياج تشغيل داخلي','صباح','مساء','ليل','المراجعة'],coverage.map(([team,driver,load,minimum])=>{
  const slots=shifts.map(s=>working.filter(x=>x.department===team&&x.shift===s).length);
  const continuousCover=['الأمن والسلامة','الاستقبال والحجز','الهندسة وتقنية المعلومات'].includes(team);
  const gap=total(slots)<minimum||(continuousCover&&slots.includes(0));
  return [team,driver,pn(load),pn(minimum),...slots.map(pn),badge(gap?'راجع التغطية':'ضمن الخطة',gap)];
 }))+
 displaySection('كشف الوردية والحضور حسب الوظيفة',['المعرّف','القسم','المنصب','المجدول','الحالة المسجلة','تعويض الفرد الشهري','الإجراء'],filtered.map(x=>[
  esc(x.number),esc(x.department),esc(x.title),x.scheduled,badge(x.shift,x.shift==='غياب'),pm(x.person),controlAction('assign','تسجيل حالة أو وردية',x.number)
 ]))+
 panel('اعتماد مسير تعويضات عن شهر منقضٍ','<p>يمثل المسير إجمالي التعويضات المعتمدة في الخطة. يستخدم الدور المختص سجل الحضور لمراجعة التغطية، وتحتاج الاستقطاعات والعمل الإضافي إلى كشوف معتمدة قبل اعتماد الرواتب الفعلية.</p>'+
 controlAction('payroll','اعتماد مسير الشهر السابق')+
 table(['الشهر','تاريخ الاعتماد','العاملون','الإجمالي','المستند'],resources().payroll.map(x=>[esc(x.month),esc(x.day),pn(x.count),pm(x.amount),esc(x.note)])));
}
function dueCheck(code) {
 const template=inspectionTemplates.find(x=>x[0]===code);
 const records=resources().checks.filter(x=>x.code===code).sort((a,b)=>b.day.localeCompare(a.day));
 return !records.length||addDays(records[0].day,template[4])<=state.day;
}
function incidentTitle(code) {
 return inspectionTemplates.find(x=>x[0]===code)?.[1]||'بلاغ تشغيلي';
}
function complianceControl() {
 const r=resources(), pending=r.incidents.filter(x=>x.status!=='مغلق');
 return classificationPanel()+controlCards([['فحوص مستحقة',pn(inspectionTemplates.filter(x=>dueCheck(x[0])).length)],['إجراءات تصحيحية مفتوحة',pn(pending.length)],['إجراءات متأخرة',pn(pending.filter(x=>x.due<state.day).length)]])+
 displaySection('الفحوص المستحقة والمسؤوليات',['الفحص','المسؤول','الدليل المطلوب','التكرار بالأيام','الحالة','الإجراء'],inspectionTemplates.map(([code,title,owner,evidence,every])=>[
  title,owner,evidence,pn(every),badge(dueCheck(code)?'مستحق':'محدّث',dueCheck(code)),controlAction('inspectOps','تسجيل نتيجة',code)
 ]))+
 displaySection('الإجراءات التصحيحية والتحقق المستقل',['المرجع','الفحص','الملاحظة','الإجراء المنفذ','الموعد','الحالة','الإجراء التالي'],r.incidents.slice().reverse().map(x=>[
  shortId(x.id),incidentTitle(x.code),esc(x.note),esc(x.fix||'بانتظار المعالجة'),esc(x.due),badge(x.status,x.status!=='مغلق'),
  x.status==='مفتوح'?controlAction('correct','توثيق المعالجة',x.id):x.status==='بانتظار التحقق'?controlAction('verifyOps','إعادة الفحص',x.id):esc(x.verifyNote||'مغلق')
 ]))+
 displaySection('سجل نتائج الفحوص',['التاريخ','الفحص','النتيجة','الدليل'],r.checks.slice().reverse().map(x=>[esc(x.day),incidentTitle(x.code),badge(x.result,x.result!=='مطابق'),esc(x.note)]))+
 displaySection('ملفات التراخيص والمراجعات المرجعية',['البند','المصدر','المسؤول','الموعد','الدليل','الحالة','الإجراء'],state.compliance.map(x=>[
  esc(x.title),esc(x.source),esc(x.owner),esc(x.due||'بحاجة إلى تاريخ'),esc(x.evidence||'بانتظار الدليل'),badge(x.status,true),action('edit','تحديث الملف',x.id)
 ]))+action('new','إضافة ملف ترخيص')+action('go','مراجعة أساس التخطيط','sitePlan');
}
function operationsSummary(start,end) {
 const filter=x=>x.day>=start&&x.day<end;
 const entries=state.ledger.filter(filter);
 const movements=resources().movements.filter(filter);
 const checks=resources().checks.filter(filter);
 const r=resources();
 const roomEntries=entries.filter(x=>x.kind==='room');
 const sales=controlSales().filter(filter);
 const direct=total(sales.filter(x=>!x.booking),x=>x.amount);
 const food=entries.filter(x=>x.kind==='pos');
 const dailySnapshots=Object.entries(r.closing).filter(([day])=>day>=start&&day<end);
 const hasCurrent=state.day>=start&&state.day<end&&!r.closing[state.day];
 return {room:total(roomEntries,x=>x.amount),nights:roomEntries.length,pos:total(food,x=>x.amount)+total(sales,x=>x.amount),
  posLines:food.length+total(sales,x=>x.qty),payment:direct-total(entries.filter(x=>x.kind==='payment'),x=>x.amount),
  stocked:total(movements.filter(x=>x.kind==='صرف'),x=>x.amount),checks:checks.length,failed:checks.filter(x=>x.result!=='مطابق').length,
  measuredRoom:total(roomEntries.filter(x=>x.day===state.day&&hasCurrent||r.closing[x.day]),x=>x.amount),
  counted:dailySnapshots.length,available:total(dailySnapshots,([,x])=>x.rooms)+(hasCurrent?kpis().available:0),
  occupancy:total(dailySnapshots,([,x])=>(x.sold??x.occupancy))+(hasCurrent?operatingInventory().sold:0),hasCurrent};
}
function reportsControl() {
 const [start,end]=periodBounds(state.day,controlPeriod);
 const through=addDays(state.day,1)<end?addDays(state.day,1):end;
 const p=budgetFor(start,through), a=operationsSummary(start,through);
 const days=[state.day,...state.closed].filter((day,i,all)=>day>=start&&day<end&&all.indexOf(day)===i);
 const coverage=workload();
 const data=[
  ['إشغال الغرف في الأيام ذات تغطية قياس',a.available?percent(a.occupancy/a.available*100):'بانتظار قياس',percent(preferences.occupancy),'لقطات الإقفال وقياس اليوم'],
  ['ليالي مرحّلة',pn(a.nights),pn(p.sold),'قيود الغرف قبل الإقفال قد تكون جزئية'],
  ['مبيعات الخدمات المسجلة / عمليات الخدمات المخططة',pn(a.posLines),pn(total(p.services,x=>x.quantity)),'مطعم PMS ومبيعات الكتالوج المسجلة'],
  ['إيراد الإقامة',pm(a.room),pm(p.roomRevenue),pm(a.room-p.roomRevenue)],
  ['إيراد الخدمات المرحّل / المخطط',pm(a.pos),pm(p.serviceRevenue),'عمليات مسجلة مقابل مبيعات متوقعة'],
  ['متوسط سعر الليالي ADR',a.nights?pm(a.room/a.nights):'بانتظار ترحيل',p.sold?pm(p.roomRevenue/p.sold):'بانتظار بيع','إيراد الغرف / الليالي المرحلة'],
  ['RevPAR للأيام ذات مخزون مقاس',a.available?pm(a.measuredRoom/a.available):'بانتظار قياس',p.available?pm(p.roomRevenue/p.available):'بانتظار قياس','يستبعد أيام الترحيل القديمة دون لقطة'],
  ['التحصيل',pm(a.payment),'بحسب مواعيد السداد','من دفعات الحسابات'],
  ['تكلفة صرف المخزون',pm(a.stocked),'بحسب الصرف الفعلي','من حركات الدفعات'],
  ['الفحوص / غير المطابقة',pn(a.checks)+' / '+pn(a.failed),'حسب دورية الفحص','من سجلات الجودة']
 ];
 return performancePanel()+controlCards([['بداية الفترة',esc(start)],['حتى يوم العمل',esc(state.day)],['أيام لها لقطات إقفال',pn(a.counted)],['غرف تحتاج تنظيفًا أو فحصًا',pn(state.rooms.filter(r=>r.clean!=='جاهزة').length)]])+
 displaySection('التشغيل المرحّل مقابل الافتراضات',['المؤشر','سجل التشغيل','المخطط للفترة','المصدر أو الفرق'],data)+
 displaySection('تفصيل الأيام المسجلة',['التاريخ','الإشغال المقاس','إيراد الغرف','الخدمات','التحصيل','الصرف','فحوص'],days.map(day=>{
  const x=operationsSummary(day,addDays(day,1));
  return [esc(day),x.available?percent(x.occupancy/x.available*100):'لم تحفظ لقطة',pm(x.room),pm(x.pos),pm(x.payment),pm(x.stocked),pn(x.checks)];
 }))+
 displaySection('التنبيهات التشغيلية الحالية',['مجال المتابعة','حالة القياس','الإجراء'],[
  ['تخطيط التشغيل',pn(state.rooms.length*preferences.occupancy/100)+' غرفة مخططة','تحديث افتراضات الإشغال من الدراسة'],
  ['المخزون',pn(inventoryPlan().filter(x=>stockBalance(x.sku)<x.min).length)+' أصناف تحت حد الطلب','مراجعة اقتراحات الشراء'],
  ['التغطية',pn(coverage.length)+' أقسام ذات محركات طلب','مراجعة الورديات لكل قسم'],
  ['الإجراءات التصحيحية',pn(resources().incidents.filter(x=>x.status!=='مغلق').length)+' إجراءات مفتوحة','التحقق من تنفيذ المعالجة']
 ])+
 displaySection('أثر العمليات',['الوقت','الإجراء'],state.audit.slice(0,50).map(x=>[esc(x.at),esc(x.label)]));
}
const resourceViews={stock:stockControl,folio:cashierControl,finance:financeControl,staff:staffControl,compliance:complianceControl,reports:reportsControl};
function resourceContent(name) {
 const legacy=['stock','staff','finance'].includes(name)?panel('السجلات المساندة السابقة','<p class="muted">سجلات متابعة يدوية. تُرحّل الحركات التشغيلية من أدوات الوحدة أعلاه.</p>'+action('new','إضافة سجل مساند')+generic(name)):'';
 return resourceViews[name]()+legacy;
}
function renderResources(name) {
 const report=['finance','reports'].includes(name);
 const searchable=['stock','staff','folio'].includes(name);
 return '<div class="heading"><div><h1>'+modules[name][0]+'</h1><p class="muted">'+esc(controlProfile().label)+' · يوم العمل '+esc(state.day)+' · إشغال تخطيطي '+percent(preferences.occupancy)+'</p></div></div>'+
 '<div class="panel plan-controls">'+choose('ops-role','دور المحاكاة',dutyRoles.map(x=>[x,x]),controller)+
 (report?choose('ops-period','الفترة حتى يوم العمل',[['day','يومية'],['month','شهرية'],['year','سنوية']],controlPeriod):'')+
 (searchable?'<label>بحث في السجلات<input id="ops-filter" type="search" value="'+esc(controlFilter)+'"></label>':'')+
 '<div><strong>بيئة تشغيل محلية</strong><small>مقارنة مع خطة الفندق. يمكن تبديل الدور لاختبار التسليم بين الفرق.</small></div></div><div id="ops-results">'+resourceContent(name)+'</div>';
}

let task;
function detailsForm(operation,target) {
 const r=resources();
 const item=stockItem(target);
 const order=r.orders.find(x=>x.id===target);
 const lot=r.lots.find(x=>x.id===target);
 const check=r.incidents.find(x=>x.id===target);
 const note=(label='المستند أو الملاحظة')=>controlInput('note',label);
 const amount=(label,value='',min=1)=>controlInput('amount',label,'number',value,min);
 const option=(name,label,values,current)=>choose(name,label,values.map(v=>[v,v]),current);
 const period=addDays(startMonth(state.day),-1).slice(0,7);
 const orderAmount=()=>pm(bill(order));
 const forms={
  request:()=>['مشتريات','طلب شراء · '+item.name,amount('الكمية',Math.max(1,item.max-stockBalance(item.sku)-total(ordersOpen(item.sku),o=>o.qty)))+
    controlInput('price','سعر الوحدة المتفق عليه','number',item.price)+note('اسم المورد')],
  approve:()=>['مالية','اعتماد أمر الشراء',row('القيمة المطلوبة',pm(order.qty*order.price))+note('مرجع الاعتماد')],
  receive:()=>['استلام','استلام أمر الشراء',amount('الكمية المقبولة',order.qty)+
    (itemForOrder(order).shelf?controlInput('expiry','آخر يوم استخدام لهذه الدفعة','date',addDays(state.day,itemForOrder(order).shelf)):'')+note('رقم سند الاستلام')],
  match:()=>['مالية','مطابقة فاتورة المورد',row('قيمة الاستلام',orderAmount())+amount('قيمة الفاتورة الصافية',bill(order))+note('رقم فاتورة المورد')+
    controlInput('due','تاريخ استحقاق الفاتورة','date',addDays(state.day,30))],
  supplierPay:()=>['مالية','تسجيل سداد المورد',row('قيمة السداد',orderAmount())+note('مرجع التحويل البنكي')],
  issue:()=>['استلام','صرف · '+item.name,amount('كمية الصرف')+note('القسم المستفيد أو مرجع الطلب')],
  count:()=>['رقابة','جرد · '+item.name,amount('الكمية الصالحة الموجودة',stockBalance(target),0)+note('مرجع محضر الجرد')],
  waste:()=>['رقابة','اعتماد إتلاف دفعة',row('الكمية المتبقية',pn(lot.quantity))+note('مرجع محضر الإتلاف')],
  cashCount:()=>['مالية','تسجيل مطابقة الصندوق',cashMethods.map(([key,label])=>controlInput(key,label,'number',r.counts[state.day]?.[key]??'',-999999999)).join('')+note('مرجع الجرد أو كشف مزود الدفع')],
  assign:()=>['موارد بشرية','تسجيل حالة الموظف '+target,option('shift','الحالة أو الوردية',[...shifts,'راحة','غياب','إجازة'],roster().find(x=>x.number===target).shift)+note('سبب التعديل أو مرجع الحضور')],
  payroll:()=>['موارد بشرية','اعتماد مسير '+period,row('التعويضات المخططة للفترة',pm(total(roster(),x=>x.person)))+
     amount('إجمالي مسير التعويضات المعتمد',total(roster(),x=>x.person))+note('مرجع مسير الرواتب الموقع')],
  inspectOps:()=>['تشغيل','نتيجة الفحص · '+incidentTitle(target),option('result','النتيجة',['مطابق','غير مطابق'],'مطابق')+note('الدليل أو وصف الملاحظة')+
    controlInput('due','موعد المعالجة عند عدم المطابقة','date',addDays(state.day,1))],
  correct:()=>['تشغيل','تنفيذ الإجراء التصحيحي',row('الملاحظة',esc(check.note))+note('وصف المعالجة ورقم الدليل')],
  verifyOps:()=>['رقابة','إعادة فحص الإجراء التصحيحي',row('المعالجة',esc(check.fix))+option('result','النتيجة',['مطابق','غير مطابق'],'مطابق')+note('دليل إعادة الفحص')],
  cardPayout:()=>['مالية','تسوية البطاقات الواردة للبنك',row('الرصيد برسم التحصيل',pm(cardExposure()))+amount('المبلغ المحول',Math.max(1,cardExposure()))+note('مرجع دفعة مزود الدفع')],
  expense:()=>['مالية','إثبات مصروف مدفوع من البنك',option('category','نوع المصروف',expenseCategories,expenseCategories[0])+amount('المبلغ المدفوع')+note('مرجع الدفع أو سند المصروف')],
  serviceSale:()=>['تشغيل','تسجيل بيع خدمة من الكتالوج',choose('service','الخدمة',dailyPlan().services.filter(x=>x.price>0).map(x=>[x.name,x.category+' · '+x.name+' · '+pm(x.price)]),target)+
    amount('عدد وحدات البيع',1)+choose('destination','التسوية',[...cashMethods,...state.bookings.filter(b=>b.status==='مقيم').map(b=>['guest:'+b.id,'على غرفة '+b.room+' · '+b.guest])],'cash')+note('مرجع الطلب أو الإيصال')],
  refund:()=>['مالية','رد رصيد حساب الضيف',amount('المبلغ المراد رده',Math.ceil(-balance(target)))+choose('method','وسيلة رد المبلغ',cashMethods,'cash')+note('مرجع تسوية عملية الرد')]
 };
 const [role,title,fields]=forms[operation]();
 permit(role);
 return [title,fields];
}
const itemForOrder=order=>stockItem(order.sku);
function openControl(operation,target) {
 const [title,fields]=detailsForm(operation,target);
 task={operation,target,day:state.day};
 $('dialog-title').textContent=title;
 $('fields').innerHTML=fields;
 $('error').textContent='';
 $('dialog').showModal();
}
function movement(sku,kind,quantity,amount,note) {
 resources().movements.push({id:id(),day:state.day,sku,kind,quantity,amount,note});
}
function consume(sku,quantity,reason,note,lots=usableLots(sku)) {
 verify(total(lots,x=>x.quantity)>=quantity,'الرصيد المتاح أقل من الكمية المطلوبة.');
 let remaining=quantity, value=0;
 for(const lot of lots) {
  const picked=Math.min(lot.quantity,remaining);
  remaining-=picked;
  lot.quantity-=picked;
  value+=picked*lot.price;
  if(!remaining) break;
 }
 movement(sku,reason,quantity,value,note);
}
function processControl(event) {
 if(!task) return false;
 event.preventDefault();
 const {operation,target,day}=task;
 const data=Object.fromEntries(new FormData(event.target));
 const note=textOf(data.note), amount=Number(data.amount), item=stockItem(target), r=resources();
 const order=r.orders.find(x=>x.id===target), lot=r.lots.find(x=>x.id===target), incident=r.incidents.find(x=>x.id===target);
 try {
  verify(day===state.day,'تغير يوم العمل. افتح العملية من جديد.');
  verify(note,'أدخل مرجعًا أو ملاحظة واضحة.');
  if('amount' in data) verify(positive(data.amount)||(operation==='count'&&amount===0),'أدخل كمية أو مبلغًا صحيحًا.');
  switch(operation) {
   case 'request':
    permit('مشتريات');
    verify(item&&positive(data.price),'تحقق من الصنف والسعر.');
    r.orders.push({id:'PO-'+id(),sku:target,qty:amount,price:Number(data.price),vendor:note,day,status:'طلب'});
    break;
   case 'approve':
    permit('مالية');
    verify(order?.status==='طلب','الطلب ليس في انتظار الاعتماد.');
    Object.assign(order,{status:'معتمد',approval:note,approvedDay:day});
    break;
   case 'receive': {
    permit('استلام');
    verify(order?.status==='معتمد'&&amount<=order.qty,'تحقق من الاعتماد ومن الكمية المتبقية.');
    const product=itemForOrder(order);
    verify(!r.orders.some(x=>x.receipt===note),'مرجع سند الاستلام مستخدم.');
    verify(!product.shelf||data.expiry>=day,'تحقق من صلاحية الدفعة قبل قبولها.');
    if(amount<order.qty) r.orders.push({...order,id:'PO-'+id(),qty:order.qty-amount,parent:order.id});
    Object.assign(order,{status:'مستلم',orderedQty:order.qty,qty:amount,received:amount,receipt:note,receivedDay:day});
    r.lots.push({id:'LOT-'+id(),sku:order.sku,quantity:amount,price:order.price,expiry:data.expiry||'',received:day,order:order.id});
    movement(order.sku,'استلام',amount,bill(order),note);
    break;
   }
   case 'match':
    permit('مالية');
    verify(order?.status==='مستلم'&&amount===bill(order),'الفاتورة يجب أن تطابق الاستلام وسعر أمر الشراء.');
    verify(!r.orders.some(x=>x.vendor===order.vendor&&x.invoice===note),'فاتورة المورد مسجلة بالفعل.');
    verify(data.due>=order.receivedDay,'تاريخ الاستحقاق يسبق الاستلام.');
    Object.assign(order,{status:'مطابق',invoice:note,due:data.due,matchedDay:day});
    break;
   case 'supplierPay':
    permit('مالية');
    verify(order?.status==='مطابق','لا يمكن سداد فاتورة غير مطابقة أو مسددة.');
    verify(!r.orders.some(x=>x.paidRef===note)&&!referenceUsed(note),'مرجع التحويل مستخدم.');
    Object.assign(order,{status:'مسدد',paidDay:day,paidRef:note});
    break;
   case 'issue':
    permit('استلام');
    consume(target,amount,'صرف',note);
    break;
   case 'count': {
    permit('رقابة');
    const diff=amount-stockBalance(target);
    if(diff<0) consume(target,-diff,'عجز',note);
    if(diff>0) {
     verify(!item.shelf,'أضف الدفعة ناقصة التسجيل من الاستلام لتوثيق صلاحيتها.');
     r.lots.push({id:'COUNT-'+id(),sku:target,quantity:diff,price:item.price,expiry:'',received:day});
     movement(target,'زيادة',diff,diff*item.price,note);
    }
    if(!diff) movement(target,'جرد مطابق',amount,0,note);
    break;
   }
   case 'waste':
    permit('رقابة');
    verify(lot?.quantity>0&&lot.expiry&&lot.expiry<day,'الدفعة ليست منتهية أو سبق إتلافها.');
    consume(lot.sku,lot.quantity,'إتلاف',note,[lot]);
    break;
   case 'cashCount':
    permit('مالية');
    verify(cashMethods.every(([key])=>data[key]!==''&&Number.isSafeInteger(Number(data[key]))),'أدخل مبالغ تسوية صحيحة.');
    r.counts[day]={...Object.fromEntries(cashMethods.map(([key])=>[key,Number(data[key])])),note};
    break;
   case 'assign':
    permit('موارد بشرية');
    r.attendance[day]??={};
    r.attendance[day][target]={shift:data.shift,note};
    break;
   case 'payroll': {
    permit('موارد بشرية');
    const month=addDays(startMonth(day),-1).slice(0,7);
    verify(!r.payroll.some(x=>x.month===month),'مسير هذا الشهر معتمد سابقًا.');
    r.payroll.push({day,month,note,count:roster().length,amount});
    break;
   }
   case 'inspectOps':
    permit('تشغيل');
    verify(data.result==='مطابق'||data.due>=day,'موعد المعالجة يسبق يوم العمل.');
    r.checks.push({code:target,day,result:data.result,note});
    if(data.result==='غير مطابق'&&!r.incidents.some(x=>x.code===target&&x.status!=='مغلق')) r.incidents.push({id:id(),code:target,day,due:data.due,note,status:'مفتوح'});
    break;
   case 'correct':
    permit('تشغيل');
    verify(incident?.status==='مفتوح','الإجراء ليس مفتوحًا للمعالجة.');
    Object.assign(incident,{fix:note,status:'بانتظار التحقق',fixedDay:day});
    break;
   case 'verifyOps':
    permit('رقابة');
    verify(incident?.status==='بانتظار التحقق','سجّل المعالجة أولًا.');
    Object.assign(incident,{verifyNote:note,verifiedDay:day,status:data.result==='مطابق'?'مغلق':'مفتوح'});
    r.checks.push({code:incident.code,day,result:data.result,note});
    break;
   case 'cardPayout':
   case 'expense': {
    permit('مالية');
    verify(!referenceUsed(note)&&!r.orders.some(x=>x.paidRef===note),'مرجع القيد مستخدم.');
    const settlement=operation==='cardPayout';
    verify(settlement?amount<=cardExposure():expenseCategories.includes(data.category),'تحقق من الرصيد المتاح أو تصنيف المصروف.');
    r.bankMoves??=[];
    r.bankMoves.push({day,kind:settlement?'settlement':'expense',title:settlement?'تسوية دفعة بطاقات':data.category,amount,ref:note});
    break;
   }
   case 'serviceSale': {
    permit('تشغيل');
    const service=dailyPlan().services.find(x=>x.name===data.service&&x.price>0);
    const b=data.destination.startsWith('guest:')?booking(data.destination.slice(6)):null;
    verify(service&&(b?.status==='مقيم'||cashMethods.some(([key])=>key===data.destination)),'اختر خدمة ووسيلة تسوية متاحة.');
    verify(!referenceUsed(note),'مرجع البيع مستخدم.');
    const sale={day,name:service.name,category:service.category,price:service.price,qty:amount,amount:amount*service.price,booking:b?.id,method:b?'folio':data.destination,ref:note};
    verify(Number.isSafeInteger(sale.amount),'إجمالي البيع غير صالح.');
    r.sales??=[];
    r.sales.push(sale);
    if(b) ledger(b,sale.name,sale.amount,'service',day,undefined,note);
    break;
   }
   case 'refund': {
    permit('مالية');
    const paid=-total(stayRows(target).filter(x=>x.kind==='payment'&&(x.method||'cash')===data.method),x=>x.amount);
    verify(booking(target)&&amount<=-balance(target)&&amount<=paid,'المبلغ يتجاوز الرصيد الدائن أو الدفعات بهذه الوسيلة.');
    verify(!referenceUsed(note),'مرجع التسوية مستخدم.');
    ledger(booking(target),'رد رصيد حساب',amount,'payment',day,data.method,note);
    break;
   }
  }
  task=undefined;
  $('dialog').close();
  save('الموارد والرقابة · '+controller+' · '+$('dialog-title').textContent+' · '+note);
 } catch(error) { $('error').textContent=error.message; }
 return true;
}
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-control]');
 if(!button) return;
 try {openControl(button.dataset.control,button.dataset.ref);} catch(error){notify(error.message);}
});
document.addEventListener('change',event=>{
 if(event.target.name==='ops-role'){controller=event.target.value; return;}
 if(event.target.name==='ops-period'){controlPeriod=event.target.value;render();}
});
document.addEventListener('input',event=>{
 if(event.target.id!=='ops-filter') return;
 controlFilter=event.target.value;
 $('ops-results').innerHTML=resourceContent(page);
});
