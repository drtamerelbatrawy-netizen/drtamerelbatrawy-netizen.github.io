'use strict';

const salesPages=['rates','channels','guests','pos','events','resort'];
const segments=[
 ['direct','الحجز المباشر المرن','DIR-BAR',27,100,0,1,1,'الإلغاء المجاني حتى اليوم السابق لوصول الضيف'],
 ['advance','الحجز المباشر المسبق','DIR-ADV',10,91,0,2,2,'حجز قبل 7 أيام · دفع مقدم · سعر غير قابل للاسترداد'],
 ['ota','منصات الحجز الإلكترونية','OTA-BAR',30,103,16,1,1,'سعر علني وعمولة تعاقدية · تأكيد التوافر قبل الإرسال'],
 ['agency','وكلاء السفر والجملة','AGT-NET',11,83,0,2,2,'سعر صافٍ تعاقدي للوكيل · حد إقامة حسب الموسم'],
 ['corporate','الشركات المتعاقدة','CORP',16,88,0,1,1,'اتفاق شركة · تسوية بحسب العقد'],
 ['group','المجموعات والفعاليات','GRP',6,81,0,2,2,'حصة تعاقدية · اعتماد العرض قبل تثبيت المجموعة']
].map(([key,label,code,share,price,commission,min,peakMin,policy])=>({key,label,code,share,price,commission,min,peakMin,policy}));
const seasons=[
 {key:'low',name:'هادئ',factor:86,months:[6,7,8]},
 {key:'regular',name:'اعتيادي',factor:100,months:[1,2,3,4,5,9]},
 {key:'high',name:'مرتفع',factor:118,months:[10,11]},
 {key:'peak',name:'ذروة',factor:138,months:[12]}
];
const monthsCaption={low:'يونيو–أغسطس',regular:'يناير–مايو وسبتمبر',high:'أكتوبر ونوفمبر',peak:'ديسمبر'};
const roomExpenseParts=[['مستلزمات وبياضات',22],['مغسلة وتنظيف متغير',26],['إمدادات ضيافة داخل الغرفة',11]];
const salesMethodURL='https://www.costar.com/products/str-benchmark/resources/guidelines/pl-data-reporting-guidelines';
const stateRateCache=new Map();
const segmentByKey=key=>segments.find(x=>x.key===key);
function effectiveSegment(segment){
 const contract=state.channels.find(x=>x.mapping===segment.code&&x.status==='معتمد');
 return contract?{...segment,commission:contract.commission,price:contract.factor||segment.price}:segment;
}
const seasonFor=day=>seasons.find(x=>x.months.includes(Number(day.slice(5,7))));
function roomPrice(unit,segment,season,weekend,custom) {
 const gross=Math.round((custom??unit.price*season.factor/100)*segment.price/100*(weekend?1.1:1));
 const fee=Math.round(gross*segment.commission/100);
 return {gross,fee,net:gross-fee};
}
function estimateRoomNight(unit,segment,day,includeOverrides=false) {
 const season=seasonFor(day);
 if(includeOverrides) segment=effectiveSegment(segment);
 const weekday=new Date(day+'T00:00:00Z').getUTCDay();
 const override=includeOverrides?state.rates.filter(r=>r.status==='معتمد'&&r.type===unit.name&&r.start<=day&&day<r.end).at(-1):null;
 return {day,...roomPrice(unit,segment,season,weekday===5||weekday===6,override?.amount),
  season:season.name,min:Math.max(season.key==='peak'?segment.peakMin:segment.min,override?.min||1)};
}
function quoteReservation(roomId,start,end,segment) {
 const p=controlProfile(), assigned=room(roomId);
 const unit=p.units.find(x=>x.name===assigned?.type);
 verify(unit&&segment&&start&&end>start,'اختر غرفة وقناة وتواريخ صحيحة.');
 const nights=workDays(start,end);
 verify(nights<=365,'مدة عرض السعر المتاحة حتى 365 ليلة.');
 const lines=Array.from({length:nights},(_,i)=>estimateRoomNight(unit,segment,addDays(start,i),true));
 const min=lines[0].min;
 verify(nights>=min,'الحد الأدنى للوصول في هذه الخطة '+pn(min)+' ليالٍ.');
 if(segment.key==='advance') verify(workDays(state.day,start)>=7,'الخطة المسبقة تتطلب الحجز قبل الوصول بـ7 أيام على الأقل.');
 return {lines,gross:total(lines,x=>x.gross),net:total(lines,x=>x.net),min};
}
function mixAllocate(count,weights) {
 let left=count, scale=total(weights);
 return weights.map(weight=>{
  const assigned=scale?Math.round(left*weight/scale):0;
  left-=assigned;scale-=weight;
  return assigned;
 });
}
function commercialRoomForecast(p,offset,days,settings) {
 const key=JSON.stringify([settings.year,settings.occupancy,p.units.map(x=>[x.name,x.count,x.price])]);
 if(!stateRateCache.has(key)){
  const seq=[{sold:0,revenue:0,fees:0}];
  const starts=Array.from({length:p.units.length},()=>Array(segments.length).fill(0));
  for(let i=0;i<daysInYear(settings.year);i++){
   const day=new Date(Date.UTC(settings.year,0,i+1)).toISOString().slice(0,10);
   const cumulative=Math.round((i+1)*p.keys*settings.occupancy/100);
   const split=mixAllocate(cumulative,p.units.map(x=>x.count));
   const totals={...seq.at(-1),sold:cumulative};
   for(const [u,unit] of p.units.entries()){
    const allocated=mixAllocate(split[u],segments.map(x=>x.share));
    for(const [j,segment] of segments.entries()){
     const qty=allocated[j]-starts[u][j];
     if(!qty) continue;
     const rate=estimateRoomNight(unit,segment,day);
     totals.revenue+=qty*rate.gross;
     totals.fees+=qty*rate.fee;
    }
    starts[u]=allocated;
   }
   seq.push(totals);
  }
  if(stateRateCache.size>=12) stateRateCache.delete(stateRateCache.keys().next().value);
  stateRateCache.set(key,seq);
 }
 const seq=stateRateCache.get(key), begin=seq[offset], end=seq[offset+days];
 return {sold:end.sold-begin.sold,revenue:end.revenue-begin.revenue,fees:end.fees-begin.fees};
}
const salesCosts = x=>x.roomRevenue?percent(x.roomCost/x.roomRevenue*100):'بانتظار الإيراد';
const showOrPending=(number,denominator,display=pn)=>denominator?display(number/denominator):'بانتظار قياس';
function metricTable() {
 const periods=[['يومي','day'],['شهري','month'],['سنوي','year']];
 const actual=periods.map(([,period])=>salesPeriod(period));
 const plans=actual.map(x=>x.plan);
 const print=(x,actual,fn)=>actual&&!x.available?'بانتظار قياس':fn(x);
 const metrics=[
 ['الليالي المتاحة للبيع · RNA',x=>pn(x.available)],
 ['الليالي المباعة · RNS',x=>pn(x.sold)],
 ['معدل الإشغال · OCC',x=>showOrPending(x.sold*100,x.available,percent)],
 ['إيراد الغرف · Rooms Rev',x=>pm(x.roomRevenue)],
 ['متوسط سعر الليلة المباعة · ADR',x=>showOrPending(x.roomRevenue,x.sold,pm)],
 ['إيراد الغرفة المتاحة · RevPAR',x=>showOrPending(x.roomRevenue,x.available,pm)],
 ['إجمالي الإيراد لكل غرفة متاحة · TRevPAR',x=>showOrPending(x.revenue,x.available,pm)],
 ['الربح التشغيلي لكل غرفة متاحة · GOPPAR',(x,actual)=>actual?'تغطية التكاليف جزئية':showOrPending(x.gop,x.available,pm)],
 ['تكلفة الإشغال المباشرة لكل ليلة مباعة · CPOR',(x,actual)=>actual&&!x.costCount?'بانتظار صرف منسوب للغرف':showOrPending(x.roomCost,x.sold,pm)],
 ['نسبة تكلفة الإشغال المباشرة إلى إيراد الغرف · Room Cost %',(x,actual)=>actual&&!x.costCount?'بانتظار صرف منسوب للغرف':salesCosts(x)]
 ];
 const heads=['المؤشر',...periods.flatMap(([label])=>[label+' · تشغيل',label+' · خطة'])];
 return table(heads,metrics.map(([label,fn])=>[label,...actual.flatMap((x,i)=>[print(x,true,v=>fn(v,true)),fn(plans[i],false)])]));
}
function salesPeriod(period){
 const [start,end]=periodBounds(state.day,period);
 const through=addDays(state.day,1)<end?addDays(state.day,1):end;
 const r=resources();
 const coverage=new Set(Object.keys(r.closing).filter(day=>day>=start&&day<through));
 const current=state.day>=start&&state.day<through&&!coverage.has(state.day);
 const eligible=state.ledger.filter(x=>x.kind==='room'&&x.amount>0&&(coverage.has(x.day)||current&&x.day===state.day));
 const currentInventory=current?operatingInventory():null;
 const closed=eligible.filter(x=>coverage.has(x.day));
 const sold=total([...coverage],day=>r.closing[day].sold??new Set(closed.filter(x=>x.day===day).map(x=>booking(x.booking)?.room||x.booking)).size)+(currentInventory?.sold??0);
 const available=total([...coverage],day=>r.closing[day].rooms)+(currentInventory?.available??0);
 const roomRevenue=total(closed,x=>x.amount)+(currentInventory?total([...currentInventory.projected.values()].filter(n=>n>0)):0);
 const other=total([...coverage,...(current?[state.day]:[])],day=>operationsSummary(day,addDays(day,1)).pos);
 const roomIssues=r.movements.filter(x=>x.kind==='صرف'&&/^(LIN|TOW|KIT|DET|BED|BTH|PAP|KDS|FLT)$/.test(x.sku)&&(coverage.has(x.day)||current&&x.day===state.day));
 return {sold,available,roomRevenue,revenue:roomRevenue+other,roomCost:total(roomIssues,x=>x.amount),costCount:roomIssues.length,days:coverage.size+(current?1:0),plan:budgetFor(start,end)};
}
function performancePanel() {
 const days=['day','month','year'].map(x=>salesPeriod(x).days);
 return panel('مؤشرات أداء الغرف · يومي وشهري وسنوي',metricTable()+
 '<p class="muted">الخطة للشهر والسنة كاملين، والتشغيل حتى يوم العمل على '+pn(days[0])+' / '+pn(days[1])+' / '+pn(days[2])+' يوم قياس على الترتيب. اليوم المفتوح يجمع الليالي المرحّلة والحجوزات المؤكدة المسعّرة لليلة قبل التدقيق. تتغير أرقام الدفاتر بالإلغاء وعدم الحضور، ويُثبّت الإقفال الليالي التي رُحّلت. تُستبعد الليالي المجانية من الليالي المباعة. التكلفة التشغيلية المعروضة للغرف تغطي الصرف المنسوب للغرف؛ وتشمل الخطة أيضًا مستلزمات الضيافة والتنظيف المتغير. تظهر المرافق والصيانة العامة في تكاليف التشغيل. الأجور الثابتة وعمولة القناة تظهر منفصلة في الموازنة.</p>'+
 '<p><a href="'+salesMethodURL+'" target="_blank" rel="noopener">أساس احتساب المؤشرات · STR / CoStar</a></p>');
}

let pricingDate;
let pricingSegment='direct';
let customersFilter='';
const outletNames=()=>controlProfile().venues.map(x=>x.name).concat('خدمة الغرف');
const rateCells=(unit,segment,season)=>{
 const mid=roomPrice(unit,segment,season,false), week=roomPrice(unit,segment,season,true);
 return [unit.name,segment.label,season.name,pm(mid.gross),pm(week.gross),pm(mid.fee),pm(mid.net),pn(season.key==='peak'?segment.peakMin:segment.min)];
};
function salesRateView() {
 const p=controlProfile(), day=pricingDate||state.day, selected=segmentByKey(pricingSegment);
 const fields='<div class="panel plan-controls">'+controlInput('price-date','يوم بيان أسعار الغرف','date',day)+choose('price-segment','قناة عرض سعر كل غرفة',segments.map(s=>[s.key,s.label]),pricingSegment)+'</div>';
 const directly=estimateRoomNight(p.units[0],selected,day,true);
 return controlCards([['أنواع الغرف',pn(p.units.length)],['خطط البيع',pn(segments.length)],['الموسم في تاريخ العرض',directly.season],['سعر القياسية للقناة المختارة',pm(directly.gross)]])+fields+
 displaySection('فترات المواسم وعوامل التسعير',['الموسم','الفترة','مؤشر السعر الأساسي','نهاية الأسبوع'],seasons.map(s=>[s.name,monthsCaption[s.key],percent(s.factor),'الجمعة والسبت · 110%']))+
 displaySection('خطط الأسعار والشروط حسب القناة',['الخطة','الرمز','حصة متوقعة','معامل سعر الموسم','عمولة','إقامة عادية / ذروة','الضابط التجاري'],segments.map(effectiveSegment).map(s=>[
  s.label,s.code,percent(s.share),percent(s.price),percent(s.commission),pn(s.min)+' / '+pn(s.peakMin),s.policy]))+
 displaySection('مصفوفة أسعار الليلة حسب نوع الغرفة والموسم والقناة',['النوع','القناة','الموسم','سعر الليلة','الجمعة والسبت','العمولة الاعتيادية','صافي الفندق الاعتيادي','أدنى ليالٍ'],
  p.units.flatMap(u=>seasons.flatMap(s=>segments.map(c=>rateCells(u,effectiveSegment(c),s)))))+
 displaySection('السعر والتوافر لكل غرفة في يوم العرض',['الغرفة','النوع','حالة البيع','سعر الليلة','عمولة القناة','صافي الفندق','أدنى ليالٍ'],
  state.rooms.map(r=>{
   const quote=estimateRoomNight(p.units.find(x=>x.name===r.type),selected,day,true);
   const taken=state.bookings.some(b=>b.room===r.id&&active(b)&&b.start<=day&&day<b.end);
   const status=blocked(r.id)?'حجب صيانة':taken?'محجوزة':'متاحة';
   return [esc(r.id),esc(r.type),badge(status,status!=='متاحة'),pm(quote.gross),pm(quote.fee),pm(quote.net),pn(quote.min)];
  }))+
 panel('استثناءات الأسعار المؤرخة','<p>الاستثناء بحالة «معتمد» يغيّر السعر الأساسي للنوع المحدد ابتداءً من تاريخ البداية، وحتى ما قبل تاريخ النهاية. يطبّق عرض الحجز معامل القناة ونهاية الأسبوع على الاستثناء. تمثل الأسعار مقترحًا تجريبيًا قبل الضرائب. تستند موازنة الدراسة إلى الخطة الأساسية؛ ينفذ عرض الحجز الاستثناءات والعقود المحلية المعتمدة.</p>'+
 action('new','إضافة استثناء سعر')+generic('rates'))+
 panel('تكلفة إشغال الغرفة في الخطة',table(['العنصر','ريال لكل ليلة مباعة'],roomExpenseParts.map(([name,cost])=>[name,pm(Math.round(cost*preferences.costIndex/100))]))+
  row('التكلفة المباشرة المعيارية لليلة',pm(standardRoomCost(preferences)))+
  '<p class="muted">تحسب النسبة بقسمة إجمالي التكلفة المباشرة للإشغال على إيراد الغرف لنفس الفترة. عمولات التوزيع وأجور القسم الثابتة معروضة خارج هذه النسبة.</p>')+performancePanel();
}
function standardRoomCost(settings) {return total(roomExpenseParts,([,x])=>Math.round(x*settings.costIndex/100));}
function salesChannelsView() {
 const p=controlProfile(), day=pricingDate||state.day;
 const results=segments.map(s=>{
  const rows=state.bookings.filter(b=>(b.segment||classifySource(b.source))===s.key);
  const quote=estimateRoomNight(p.units[0],s,day,true);
  const ids=new Set(rows.map(b=>b.id));
  const recognized=state.ledger.filter(x=>x.kind==='room'&&x.day===state.day&&ids.has(x.booking));
  return [s.label,s.code,pn(rows.length),pn(rows.filter(b=>b.status==='مقيم').length),pm(total(recognized,x=>x.amount)),
   percent(s.share),percent(effectiveSegment(s).commission),pm(quote.gross),pm(quote.net),s.policy];
 });
 const month=periodBounds(state.day,'month');
 const horizon=30;
 const sold=segments.map(s=>{
  const rows=state.bookings.filter(b=>(b.segment||classifySource(b.source))===s.key&&active(b));
  const nights=total(rows,b=>Math.max(0,workDays(b.start>state.day?b.start:state.day,b.end<addDays(state.day,horizon)?b.end:addDays(state.day,horizon))));
  return [s.label,pn(rows.length),pn(nights)];
 });
 return controlCards([['حجوزات ملغاة',pn(state.bookings.filter(x=>x.status==='ملغى').length)],['وصول مثبت اليوم',pn(state.bookings.filter(b=>active(b)&&b.start===state.day).length)],['نطاق البيان',esc(month[0].slice(0,7))]])+
 displaySection('التوزيع والحجوزات واقتصاد القناة',['القناة','رمز السعر','الحجوزات في السجل','المقيمون','إيراد غرف مرحّل اليوم','مزيج التخطيط','العمولة','سعر القياسية في يوم العرض','الصافي','الشروط'],results)+
 displaySection('الطلب المؤكد خلال 30 يومًا',['القناة','حجوزات مفتوحة في السجل','ليال محجوزة خلال الأفق'],sold)+
 panel('عقود القنوات ومفاتيح الربط','<p>يضبط العقد المعتمد معامل السعر والعمولة في عروض الحجز إذا طابق رمزه إحدى خطط البيع أعلاه. يعكس التوافر سجل فندق أنام، وتحتاج المزامنة الفعلية إلى ربط مزود القناة.</p>'+action('new','إضافة عقد قناة')+generic('channels'))+
 action('go','فتح الأسعار والإيرادات','rates')+action('go','فتح الحجوزات','bookings');
}
function classifySource(value='') {
 const txt=value.toLowerCase();
 return /شركة|شرك|corp/.test(txt)?'corporate':/وكيل|وكال|agent|agt/.test(txt)?'agency':/منص|booking|expedia|ota/.test(txt)?'ota':/مجموع|grp/.test(txt)?'group':/مسبق|adv/.test(txt)?'advance':'direct';
}
function salesGuestsView() {
 const profiles=state.guests;
 const current=state.bookings.filter(b=>b.status==='مقيم');
 const lines=profiles.filter(x=>!customersFilter||[x.title,x.preference,x.tier].join(' ').includes(customersFilter)).map(x=>{
  const b=booking(x.bookingId)||state.bookings.find(y=>y.guest===x.title);
  return [esc(x.title),esc(x.tier),esc(x.preference),esc(x.consent),b?esc(b.room+' · '+b.status):'ملف ضيف مستقل',esc(x.issue||'لا طلب قائم'),badge(x.serviceState||'مسجل'),action('edit','تعديل الملف',x.id)+(x.issue&&x.serviceState!=='مغلق'?salesAction('guestResolve','إغلاق الطلب',x.id):'')];
 });
 return controlCards([['ملفات الضيوف',pn(profiles.length)],['إقامات جارية',pn(current.length)],['طلبات لم تُغلق',pn(profiles.filter(x=>x.issue&&x.serviceState!=='مغلق').length)]])+
 panel('ملفات الضيوف والطلبات','<label>بحث في الملفات<input id="guest-search" type="search" value="'+esc(customersFilter)+'"></label><div id="guest-results">'+
 table(['الضيف','العضوية','التفضيل','الموافقة','الإقامة المرتبطة','الطلب','حالته','الإجراء'],lines)+'</div>'+action('new','إضافة ملف ضيف'))+
 displaySection('ضيوف مقيمون دون ملف مختار',['الضيف','الغرفة','الوصول','المغادرة','الإجراء'],current.filter(b=>!profiles.some(x=>x.bookingId===b.id||x.title===b.guest)).map(b=>[
  esc(b.guest),esc(b.room),esc(b.start),esc(b.end),salesAction('guestAttach','فتح ملف من الحجز',b.id)
 ]));
}
function salesPosView() {
 const period=budgetFor(state.day,addDays(state.day,1));
 const direct=controlSales().filter(x=>x.day===state.day&&foodTypes.has(x.category));
 const roomOrders=state.ledger.filter(x=>x.kind==='pos'&&x.day===state.day);
 const foodUnits=total(period.services.filter(s=>foodCovers.has(s.name)),x=>x.quantity);
 const property=controlProfile(), work=workloadTargets(property);
 return controlCards([['المطاعم',pn(property.restaurants)],['المقاعد مع المقهى',pn(total(property.venues,x=>x.seats))],
 ['وجبات وتغطيات مخططة لليوم',pn(foodUnits)],['إيراد الأغذية والمشروبات المرحّل',pm(total(roomOrders,x=>x.amount)+total(direct,x=>x.amount))]])+
 displaySection('أداء المنافذ وحمل الإنتاج',['المنفذ','المقاعد','ساعات الخدمة','نطاق المطبخ','وحدات مخططة','إيراد مخطط','وحدات مرحّلة','إيراد مرحّل'],property.venues.map(o=>{
  const plan=period.services.filter(x=>x.category===o.name), sales=direct.filter(x=>x.category===o.name), local=roomOrders.filter(x=>x.title.startsWith(o.name+' ·'));
  return [o.name,pn(o.seats),pn(o.hours),o.kitchen,pn(total(plan,x=>x.quantity)),pm(total(plan,x=>x.revenue)),pn(total(sales,x=>x.qty)+local.length),pm(total(sales,x=>x.amount)+total(local,x=>x.amount))];
 }))+
 panel('إنتاج المطبخ المركزي وخدمة الغرف',row('الطهاة التشغيليون في الملاك',pn(work.cooks))+row('مساعدو التحضير',pn(work.kitchenAssist))+row('عمال غسيل الأواني',pn(work.stewards))+row('فريق خدمة الغرف',pn(work.roomService))+action('go','الورديات والتغطية','staff'))+
 panel('تسجيل الطلب والسداد',choose('ops-role','دور المحاكاة',dutyRoles.map(x=>[x,x]),controller)+controlAction('serviceSale','بيع بالكتالوج أو تحميل على الغرفة')+action('new','تحميل طلب مطعم مسعّر على الغرفة'))+
 displaySection('المبيعات من الكتالوج اليوم',['المنفذ','الخدمة','الوحدات','السعر','الإيراد','المستند'],direct.map(x=>[esc(x.category),esc(x.name),pn(x.qty),pm(x.price),pm(x.amount),esc(x.ref)]))+
 panel('طلبات المطاعم على الحساب',generic('pos'))+action('go','فتح كتالوج الخدمات','servicePlan');
}
const salePrice=name=>dailyPlan().services.find(x=>x.name===name)?.price;
function salesShortcut(name) {
 const price=salePrice(name);
 if(price===undefined) return 'خارج نطاق الخدمات لهذا النوع';
 return esc(name)+' · '+pm(price)+controlAction('serviceSale','فتح البيع',name);
}
const venueSpaces=()=>[['قاعة الاجتماعات','قيد التحقق'],['قاعة 2',70],['قاعة 3',32],['قاعة 4',60]].slice(0,controlProfile().halls);
const resortSpaces=[['غرفة علاج 1',1],['غرفة علاج 2',1],['المسبح',35],['نادي الأطفال',12],['الملعب',8],['نادي اللياقة',18]];
function salesEventsView() {
 const rows=state.events.filter(x=>x.end.slice(0,10)>=state.day&&x.status==='مؤكد');
 const upcoming=total(rows,x=>x.rooms);
 const reservationsFor=id=>state.bookings.filter(b=>b.eventId===id&&active(b));
 return controlCards([['القاعات',pn(venueSpaces().length)],['فعاليات مؤكدة قائمة',pn(rows.length)],['حصص غرف في العقود القائمة',pn(upcoming)]])+
 displaySection('سعة القاعات والتشغيل',['القاعة','السعة التشغيلية','فعاليات قادمة مؤكدة'],venueSpaces().map(([name,seats])=>[name,esc(seats),pn(rows.filter(x=>x.hall===name).length)]))+
 panel('باقات القاعات والمبيعات المرتبطة',choose('ops-role','دور المحاكاة',dutyRoles.map(x=>[x,x]),controller)+
 ['قاعة اجتماعات نصف يوم','قاعة مناسبات يوم كامل','تقديم طعام للاجتماع','صوتيات وشاشة'].map(x=>row(x,salesShortcut(x))).join(''))+
 displaySection('تخصيص غرف المجموعات',['الفعالية','الحصة المتعاقد عليها','حجوزات مرتبطة','متبقي التخصيص'],rows.map(x=>[esc(x.title),pn(x.rooms),pn(reservationsFor(x.id).length),pn(Math.max(0,x.rooms-reservationsFor(x.id).length))]))+
 panel('الحجوزات المؤسسية وأوامر تشغيل الفعاليات','<p class="muted">حصة الغرف هنا التزام تعاقدي للمتابعة. تُثبت الغرف فعليًا بتسجيل حجوزات المجموعة في نظام الإقامة.</p>'+
 action('new','تسجيل فعالية أو مجموعة')+generic('events'))+action('go','تسعير بيع القاعات','servicePlan');
}
function salesActivitiesView() {
 const upcoming=state.resort.filter(x=>x.end.slice(0,10)>=state.day&&x.status==='مؤكد');
 return controlCards([['المرافق القابلة للجدولة',pn(resortSpaces.length)],['مواعيد قائمة مؤكدة',pn(upcoming.length)],['حضور مؤكد في المواعيد',pn(total(upcoming,x=>x.capacity))]])+
 displaySection('مرافق الأنشطة والسعة لكل موعد',['المرفق','السعة للمجموعة','مواعيد مؤكدة قادمة'],resortSpaces.map(([name,seats])=>[name,pn(seats),pn(upcoming.filter(x=>x.resource===name).length)]))+
 panel('بيع المواعيد والأنشطة',choose('ops-role','دور المحاكاة',dutyRoles.map(x=>[x,x]),controller)+
 ['جلسة تدليك','جلسة ساونا','نادي الأطفال','تنس أو ملعب','تذكرة دخول لغير المقيمين'].map(x=>row(x,salesShortcut(x))).join(''))+
 panel('جدولة المواعيد والموارد',action('new','حجز موعد نشاط')+generic('resort'))+action('go','أسعار السبا والأنشطة','servicePlan');
}
const salesAction=(op,label,ref)=>'<button class="action" data-sales="'+op+'" data-ref="'+esc(ref)+'">'+label+'</button>';
const salesViews={rates:salesRateView,channels:salesChannelsView,guests:salesGuestsView,pos:salesPosView,events:salesEventsView,resort:salesActivitiesView};
function renderSales(name){
 const [title,description]=modules[name];
 return '<div class="heading"><div><h1>'+title+'</h1><p class="muted">'+description+' · يوم العمل '+esc(state.day)+'</p></div></div>'+salesViews[name]();
}

function nightlyCharge(reservation,day) {
 return reservation.nightlyRates?.find(x=>x.day===day)?.gross??reservation.rate;
}
function roomPricePreview() {
 const container=$('room-price-preview');
 if(!container) return;
 const form=$('record-form');
 const values=Object.fromEntries(new FormData(form));
 if(!values.room||!values.start||!values.end){container.textContent='اختر الغرفة والتواريخ لمعاينة السعر.';return;}
 if(values.rate!==''){container.textContent='سيُستخدم السعر التعاقدي المُدخل لكل ليلة.';return;}
 try {
  const quote=quoteReservation(values.room,values.start,values.end,segmentByKey(values.source));
  container.innerHTML=row('إجمالي الإقامة قبل الضرائب',pm(quote.gross))+row('صافي الفندق بعد عمولة القناة',pm(quote.net))+
   table(['الليلة','الموسم','السعر','العمولة'],quote.lines.slice(0,30).map(x=>[esc(x.day),x.season,pm(x.gross),pm(x.fee)]))+
   (quote.lines.length>30?'<p>يعرض الجدول أول 30 ليلة من عرض السعر.</p>':'');
 } catch(error){container.textContent=error.message;}
}
function prepareReservationPrice(data,record) {
 const selected=segmentByKey(data.source);
 verify(selected,'اختر خطة بيع معتمدة من القائمة.');
 data.segment=selected.key;
 data.source=selected.label;
 if(data.rate===''){
  const unchanged=record.nightlyRates&&['room','start','end','segment'].every(key=>record[key]===data[key]);
  data.nightlyRates=unchanged?record.nightlyRates:quoteReservation(data.room,data.start,data.end,selected).lines;
  data.rate=Math.round(total(data.nightlyRates,x=>x.gross)/data.nightlyRates.length);
 }else{
  verify(Number.isSafeInteger(Number(data.rate))&&Number(data.rate)>=0,'سعر الليلة يجب أن يكون عددًا صحيحًا.');
  data.rate=Number(data.rate);
  data.nightlyRates=null;
 }
}
function salesSeed(){
 if(state.salesVersion) return;
 const day=state.day;
 for(const s of segments) if(!state.channels.some(x=>x.mapping===s.code)) state.channels.push({id:'SALES-'+s.code,title:s.label,mapping:s.code,commission:s.commission,status:'بيئة محلية'});
 const residents=state.bookings.filter(b=>b.status==='مقيم');
 for(const [i,b] of residents.slice(0,8).entries()) if(!state.guests.some(x=>x.title===b.guest)) {
  state.guests.push({id:'PROFILE-'+b.id,bookingId:b.id,title:b.guest,tier:['أساسية','فضية','ذهبية'][i%3],preference:['غرفة هادئة','وسادة إضافية','قرب المصعد'][i%3],
   consent:i%2?'موافقة على مراسلات الإقامة':'مراسلات تعاقدية فقط',issue:i%3===1?'متابعة ترتيب موعد خدمة':'',serviceState:i%3===1?'مفتوح':'مسجل'});
 }
 const dateTime=(offset,time)=>addDays(day,offset)+'T'+time;
 const eventRows=[
  ['SALES-E2','ورشة أعمال','عميل شركات تجريبي','قاعة 2',1,'09:30','13:30',8,'تهيئة فصل تدريبي وخدمة قهوة'],
  ['SALES-E3','اجتماع مجلس إدارة','عميل محلي تجريبي','قاعة 3',2,'14:00','17:00',2,'شاشة عرض وضيافة 12 شخصًا']
 ];
 for(const [id,title,company,hall,offset,a,b,rooms,beo] of eventRows){
  const entry={id,title,company,hall,start:dateTime(offset,a),end:dateTime(offset,b),rooms,beo,status:'مؤكد'};
  if(venueSpaces().some(([name])=>name===hall)&&!state.events.some(x=>x.hall===hall&&overlap(x,entry))) state.events.push(entry);
 }
 const activityRows=[
  ['SALES-A2','جلسة ساونا','غرفة علاج 2','معالج 2','سرير علاجي 2',0,'16:00','16:45',1],
  ['SALES-A3','نادي الأطفال','نادي الأطفال','مشرف أطفال','عدة أنشطة أطفال',1,'14:00','15:00',8],
  ['SALES-A4','موعد ملعب','الملعب','مشرف رياضة','طقم ملعب',1,'17:00','18:00',4]
 ];
 for(const [id,title,resource,staff,equipment,offset,a,b,capacity] of activityRows){
  const entry={id,title,resource,staff,equipment,start:dateTime(offset,a),end:dateTime(offset,b),capacity,status:'مؤكد'};
  if(!state.resort.some(x=>overlap(x,entry)&&['resource','staff','equipment'].some(key=>x[key]===entry[key]))) state.resort.push(entry);
 }
 state.salesVersion=1;
 localStorage.setItem(chosenKey(),JSON.stringify(state));
}
function dashboardDirectory() {
 const detail={
  control:'السعة والإشغال وموازنة التشغيل',capitalSummary:'إجمالي الاستثمار والعائد',
  departmentPL:'إيراد وتكلفة وربح كل قسم',operatingCosts:'أجور ومرافق وصافي الربح',
  dashboard:'التشغيل والمؤشرات',rooms:pn(state.rooms.length)+' غرفة في المخزون',bookings:pn(state.bookings.filter(active).length)+' حجز مفتوح',
  reception:pn(state.bookings.filter(b=>b.status==='مؤكد'&&b.start<=state.day).length)+' وصول يحتاج متابعة',
  housekeeping:pn(state.rooms.filter(x=>x.clean!=='جاهزة').length)+' غرفة للتجهيز أو الفحص',
  maintenance:pn(state.maintenance.filter(x=>x.status!=='مغلق').length)+' بلاغ مفتوح',
  rates:pn(segments.length)+' خطط تسعير',servicePlan:pn(dailyPlan().services.length)+' خدمة في الكتالوج',
  channels:pn(state.channels.length)+' عقد وقناة',guests:pn(state.guests.length)+' ملف ضيف',
  pos:pm(operationsSummary(state.day,addDays(state.day,1)).pos)+' إيراد خدمات مرحّل',
  events:pn(state.events.filter(x=>x.status==='مؤكد'&&x.end.slice(0,10)>=state.day).length)+' فعالية قائمة',
  resort:pn(state.resort.filter(x=>x.status==='مؤكد'&&x.end.slice(0,10)>=state.day).length)+' موعد قائم',
  stock:pn(inventoryPlan().filter(x=>stockBalance(x.sku)<x.min).length)+' أصناف تحتاج متابعة',
  folio:pm(total(Object.values(cashTotals(state.day))))+' تحصيل اليوم',
  finance:pm(cardExposure())+' بطاقات برسم التحصيل',
  staff:pn(roster().filter(x=>shifts.includes(x.shift)).length)+' مجدولون في يوم العمل',
  compliance:pn(resources().incidents.filter(x=>x.status!=='مغلق').length)+' إجراء تصحيحي مفتوح',
  reports:'مقارنة التشغيل بالمستهدف',
  sitePlan:'الأرض والغرف والمرافق',staffingPlan:'الملاك والتعويضات',equipmentPlan:'تجهيزات المشروع',
  constructionPlan:'الموازنة والكميات',feasibility:'مؤشرات الجدوى لكل سيناريو'
 };
 return groups.map(([name,list])=>panel(name,'<div class="dash-directory">'+list.split(' ').filter(key=>!['dashboard','control'].includes(key)).map(key=>
 '<button class="outline dash-module" data-do="go" data-id="'+key+'"><strong>'+modules[key][0]+'</strong><small>'+esc(detail[key])+'</small></button>').join('')+'</div>')).join('');
}
document.addEventListener('change',event=>{
 const field=event.target;
 if(field.name==='price-date'&&field.value){pricingDate=field.value;render();}
 if(field.name==='price-segment'){pricingSegment=field.value;render();}
 if(field.closest('#record-form')&&['room','start','end','source','rate'].includes(field.name)) roomPricePreview();
});
document.addEventListener('input',event=>{
 if(event.target.id==='guest-search'){
  customersFilter=event.target.value.trim();
  const replacement=document.createElement('div');
  replacement.innerHTML=salesGuestsView();
  $('guest-results').innerHTML=replacement.querySelector('#guest-results').innerHTML;
 }
});
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-sales]');
 if(!button) return;
 const ref=button.dataset.ref;
 if(button.dataset.sales==='guestAttach'){
  const b=booking(ref);
  if(!b||state.guests.some(x=>x.bookingId===b.id)) return;
  state.guests.push({id:id(),bookingId:b.id,title:b.guest,tier:'أساسية',preference:'قيد التسجيل',consent:'قيد التوثيق',issue:'',serviceState:'مسجل'});
  save('تم فتح ملف ضيف من الحجز · '+b.room);
 }
 if(button.dataset.sales==='guestResolve'){
  const profile=state.guests.find(x=>x.id===ref);
  if(!profile||!confirm('تأكيد إغلاق طلب الضيف؟')) return;
  profile.serviceState='مغلق';
  profile.resolved=state.day;
  save('تم إغلاق طلب الضيف · '+profile.title);
 }
});

function renderSalesCatalog(){
 const day=state.day, current=controlSales().filter(x=>x.day===day);
 const settings={...preferences,year:Number(day.slice(0,4)),month:Number(day.slice(5,7))};
 const [start,end]=periodBounds(day,'month');
 const year=periodBounds(day,'year');
 const allSales=controlSales();
 const monthly=budgetFor(start,end), annual=budgetFor(...year);
 const today=budgetFor(day,addDays(day,1));
 const serviceRows=annual.services.map((service,i)=>{
  const recorded=current.filter(x=>x.name===service.name);
  const monthlyActual=allSales.filter(x=>x.name===service.name&&x.day>=start&&x.day<=day);
  const annualActual=allSales.filter(x=>x.name===service.name&&x.day>=year[0]&&x.day<=day);
  return [esc(service.category),esc(service.name),esc(service.unit),service.price?pm(service.price):'مشمول بالإقامة',
    pn(today.services[i].quantity),pn(monthly.services[i].quantity),pn(service.quantity),pm(today.services[i].revenue),pm(monthly.services[i].revenue),pm(service.revenue),
    pn(total(recorded,x=>x.qty)),pm(total(recorded,x=>x.amount)),pm(total(monthlyActual,x=>x.amount)),pm(total(annualActual,x=>x.amount)),percent(service.variable),esc(service.driver),service.price?budgetButton('servicePrices',service.name,budgetInputs.servicePrices[service.name]??Math.round(service.price*100/preferences.priceIndex)):'مشمول'];
 });
 return '<div class="heading"><div><h1>'+planningTitles.servicePlan+'</h1><p class="muted">'+esc(controlProfile().label)+' · يوم العمل '+esc(day)+' · إشغال مخطط '+percent(settings.occupancy)+'</p></div></div>'+
 controlCards([['خدمات الكتالوج',pn(annual.services.length)],['إيراد الخدمات المخطط للشهر',pm(monthly.serviceRevenue)],['إيراد اليوم المرحّل من الكتالوج',pm(total(current,x=>x.amount))]])+
 panel('تسجيل البيع',choose('ops-role','دور المحاكاة',dutyRoles.map(x=>[x,x]),controller)+controlAction('serviceSale','تسجيل بيع بسعر الكتالوج')+action('go','متابعة حسابات الضيوف','folio'))+
 displaySection('أسعار الخدمات والكمية والإيراد حسب الفترة',['القسم','الخدمة','الوحدة','السعر','كمية يوم · خطة','كمية شهر · خطة','كمية سنة · خطة','إيراد يوم · خطة','إيراد شهر · خطة','إيراد سنة · خطة','كمية يوم · كتالوج','إيراد يوم · كتالوج','إيراد شهر · كتالوج','إيراد سنة · كتالوج','تكلفة متغيرة','محدد الطلب','الإجراء'],serviceRows)+
 '<p class="muted">السجل الفعلي في الجدول يطابق مبيعات الكتالوج المسجلة للخدمة بالاسم. تظهر طلبات نقاط البيع المسعّرة يدويًا في صفحة المطاعم وتقارير التشغيل. الأسعار افتراضات لمتوسط التذكرة وتختلف عن سعر طبق منفرد.</p><p><a href="https://assets.diriyah.me/pdf/medheef-menu.pdf">مرجع قائمة بالرياض</a> · <a href="https://www.marriott.com/en-us/destinations/saudi-arabia/riyadh/room-service-hotels.mi">مقارنة منشآت وأسعار غرف بالرياض</a></p>';
}
