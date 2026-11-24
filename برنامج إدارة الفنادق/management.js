'use strict';

const managementPages={control:'لوحة التحكم',capitalSummary:'إجماليات الاستثمار والعائد'};
const storageFor=scenario=>scenario==='hotel'?key:key+'-'+scenario;
const chosenKey=()=>storageFor(preferences.scenario);
const classificationReferences={
 hotel:['hotels',[317,405,540,680,950,1155]],
 resort:['resorts',[0,0,567,723,999,1226]],
 apartments:['apartments-hotel',[326,415,555,695,969,1180]]
};
const starLabels=['غير محدد','نجمة واحدة','نجمتان','3 نجوم','4 نجوم','5 نجوم','5 نجوم فاخر'];
function classificationLabel(settings=preferences) {
 const n=settings.classificationByProperty?.[settings.scenario]??0;
 return n?'مستهدف '+starLabels[n]:'التصنيف المستهدف غير محدد';
}
function starFields(scenario) {
 const options=starLabels.map((name,n)=>[String(n),name]).filter(([n])=>Number(n)===0||classificationReferences[scenario][1][Number(n)-1]>0);
 return choose('targetStars','تصنيف النجوم المستهدف',options,String(preferences.classificationByProperty?.[scenario]??0));
}
function classificationPanel(){
 const [doc,points]=classificationReferences[preferences.scenario];
 const n=preferences.classificationByProperty?.[preferences.scenario]??0;
 const link='https://cdn.mt.gov.sa/mtportal/mt-fe-production/content/policies-regulations/documents/classification-criteria/'+doc+'-classification-criteria-ar-v01.pdf';
 const mix=capacityMix();
 const keys=total(mix,x=>x[1]), count=keys;
 return panel('التصنيف السياحي المستهدف',row('الفئة المختارة',esc(classificationLabel()))+
  (n?row('الحد الأدنى للنقاط في المرجع',pn(points[n-1])):'')+
  (preferences.scenario==='apartments'?row('حصة الشقق من وحدات الضيافة',pn(count)+' من '+pn(keys)+' · '+percent(count/keys*100)+' · جميع الوحدات شقق مجهزة')+row('الحد المرجعي لحصة الشقق','51%'):'')+
  '<p class="muted">لم يحدد العميل فئة النجوم المستهدفة بعد. اختر الفئة من لوحة التحكم ليظهر الحد الأدنى للنقاط. نسخة المرجع المرفقة في ملفات المشروع موسومة 2022 V1.0، ويُراجع الإصدار الساري عند دراسة الامتثال. شهادة التصنيف تصدر من الجهة المختصة.</p><p><a href="'+link+'" target="_blank" rel="noopener">مرجع معايير التصنيف · وزارة السياحة</a></p>');
}
const capacityMix=(settings=preferences)=>{
 const source=scenarios[settings.scenario].rooms;
 const counts=settings.roomMix?.[settings.scenario]||source.map(x=>x[1]);
 return source.map((row,i)=>[row[0],counts[i],...row.slice(2)]);
};
function updateRoomInventory(records,mix){
 const reserved=new Set(records.bookings.filter(active).map(b=>b.room));
 const underWork=new Set(records.maintenance.filter(x=>x.status!=='مغلق').map(x=>x.room));
 const kept=records.rooms.slice(), retired=(records.retiredRooms||[]).slice();
 for(const [type,count] of mix){
  const typed=kept.filter(r=>r.type===type);
  const candidates=typed.filter(r=>!reserved.has(r.id)&&!underWork.has(r.id)).reverse();
  const deleted=Math.max(0,typed.length-count);
  verify(candidates.length>=deleted,'لا يمكن خفض «'+type+'» دون تسوية الحجوزات أو أعمال الصيانة القائمة.');
  for(const room of candidates.slice(0,deleted)){
   kept.splice(kept.indexOf(room),1);retired.push(room);
  }
 }
 const used=new Set([...kept,...retired].map(x=>x.id));
 let slot=0;
 for(const [type,count] of mix){
  let remaining=count-kept.filter(r=>r.type===type).length;
  const recover=retired.filter(r=>r.type===type).slice(0,Math.max(0,remaining));
  for(const room of recover){retired.splice(retired.indexOf(room),1);kept.push(room);remaining--;}
  while(remaining>0){
   let id;
   do{ id=String((Math.floor(slot/30)+1)*100+slot++%30+1); }while(used.has(id));
   used.add(id);kept.push({id,type,clean:'جاهزة'});remaining--;
  }
 }
 return {rooms:kept,retiredRooms:retired};
}
const capitalInputs=[
 ['startupCost','ما قبل الافتتاح والتدريب والتجهيز الأولي'],['workingCapital','رأس المال العامل الابتدائي'],
 ['designPercent','نسبة التصميم والإشراف %'],['reservePercent','نسبة الاحتياطي الإنشائي %']
];
const capitalSettings={landCost:0,startupCost:0,workingCapital:0,designPercent:0,reservePercent:0};
function capitalSetting(settings,key){
 return settings.capitalByProperty?.[settings.scenario]?.[key]??(settings.scenario==='hotel'?settings[key]:undefined)??capitalSettings[key];
}
function capitalFields(scenario){
 const settings={...preferences,scenario};
 return capitalInputs.map(([key,label])=>numberField(key,label,capitalSetting(settings,key),0,key.endsWith('Percent')?100:1000000000)).join('');
}
function investment(p,settings=preferences){
 const base=capitalBase(p,settings);
 const design=Math.round(base.build*capitalSetting(settings,'designPercent')/100);
 const contingency=Math.round(base.build*capitalSetting(settings,'reservePercent')/100);
 const equipmentRows=equipment(p,settings);
 const rows=[
  ['تهيئة المبنى والتشطيبات والأنظمة الثابتة',base.build],['الهندسة والإشراف',design],['احتياطي الأعمال الإنشائية',contingency],
  ...Array.from(new Set(equipmentRows.map(x=>x.zone))).map(zone=>['تجهيز · '+zone,total(equipmentRows.filter(x=>x.zone===zone),x=>x.quantity*x.price)]),
  ['الديكور · تقدير العميل',anamRecords.client.decor],
  ['تكاليف ما قبل الافتتاح',capitalSetting(settings,'startupCost')],['رأس المال العامل الابتدائي',capitalSetting(settings,'workingCapital')]
 ];
 return {base,design,contingency,rows,total:total(rows,x=>x[1])};
}
const returnPercent=(n,d)=>d?(n*100/d).toFixed(2)+'%':'بانتظار مدخل';
function returnScenario(p,settings=preferences){
 const occupancy=75, target=0.171;
 const targetProfit=p.investmentEstimate*target;
 for(let priceIndex=100;priceIndex<=400;priceIndex++){
  const scenario={...settings,occupancy,priceIndex};
  const forecastYear=forecast(profile(scenario),0,daysInYear(scenario.year),scenario);
  if(forecastYear.net>=targetProfit) return {occupancy,priceIndex,...forecastYear};
 }
 return null;
}
function returnScenarioPanel(p){
 const plan=returnScenario(p);
 return panel('سيناريو تجاوز عائد 17%',
  row('صافي الربح المطلوب عند 17%',pm(p.investmentEstimate*0.17))+
  (plan?row('الإشغال المفترض',percent(plan.occupancy))+
   row('معامل أسعار الإقامة والخدمات',percent(plan.priceIndex))+
   row('متوسط سعر الليلة ADR',pm(plan.roomRevenue/plan.sold))+
   row('صافي الربح السنوي المتوقع',pm(plan.net))+
   row('العائد السنوي المتوقع',returnPercent(plan.net,p.investmentEstimate)):
   row('النتيجة','الهدف خارج نطاق الأسعار المختبر'))+
  '<p class="muted">سيناريو تخطيطي عند إشغال 75% مع تعديل أسعار البيع والإبقاء على مدخلات التكلفة الحالية. يتطلب تحقق الأسعار والإشغال من السوق.</p>');
}
function fundingPanel(p){
 const c=anamRecords.client, t=anamRecords.transfers;
 return panel('مصادر التمويل والمبالغ المدفوعة',
  row('التمويل المستهدف',pm(p.fundingTarget))+
  row('الهيكل المطروح مبدئيًا',pn(c.loanShare)+'% تمويل · '+pn(c.ownShare)+'% مساهمة ذاتية')+
  row('المساهمة الذاتية المذكورة من العميل',pm(c.ownContribution))+
  row('الفرق بين الاستثمار والتمويل المستهدف',pm(p.investmentEstimate-p.fundingTarget))+
  row('مبالغ ذكر العميل سدادها',pm(c.paid))+
  row('بيان الحوالات والمبالغ المسلّمة',pm(t.total)+' في '+pn(t.count)+' حوالة من '+t.from+' إلى '+t.to)+
  row('منها للمشروع وفق البيان',pm(t.project))+row('منها سلفة',pm(t.advance))+
  '<p class="muted">هذه بيانات العميل الأولية. لا تُعد موافقة تمويلية ولا إثباتًا للسداد، وتُطابق بالإيصالات والعقود. نسبة 70% من 7.5 مليون تساوي 5.25 مليون، فيُوضَّح هل المستهدف 5 ملايين هو القرض وحده.</p>');
}
function investmentPage(){
 const p=profile(), value=investment(p), year=forecast(p,0,daysInYear(preferences.year));
 const base=value.total, projectTotal=p.investmentEstimate;
 const margin=[
 ['إيرادات الغرف',year.roomRevenue],['إجمالي إيرادات المنشأة',year.revenue],['مجمل ربح الأقسام',year.revenue-year.wages-year.roomCost-year.servicesCost-year.distribution],
 ['الربح التشغيلي GOP',year.gop],['صافي الربح بعد المدخلات',year.net]
 ];
 return '<div class="heading"><div><h1>إجماليات الاستثمار والعائد</h1><p class="muted">'+esc(p.label)+' · موازنة '+pn(preferences.year)+'</p></div>'+
 action('go','تعديل مدخلات الاستثمار','control','primary')+'</div>'+
 controlCards([['إجمالي الاستثمار التقديري',pm(p.investmentEstimate)],['التمويل المستهدف',pm(p.fundingTarget)],['حصر البنود المدرجة',pm(base)],['تكلفة المتر المبني',pm(projectTotal/p.gross)],['تكلفة كل غرفة أو جناح',pm(projectTotal/p.keys)],['صافي الربح التخطيطي إلى الاستثمار',returnPercent(year.net,p.investmentEstimate)]])+
 fundingPanel(p)+
 panel('مطابقة التقدير الإجمالي مع البنود المحصورة',row('إجمالي الاستثمار التقديري من العميل',pm(projectTotal))+
 row('البنود المحصورة بالمستندات والتقديرات',pm(base))+
 row('رصيد غير مفصل بعد',pm(Math.max(0,projectTotal-base)))+
 row('قيمة عقد أعمال التعديلات الموقع رقم '+esc(anamRecords.contractor.contract),pm(anamRecords.contractor.value))+
 '<p>الرصيد غير المفصل يحتاج حصرًا من المالك. البنود التي لم تُسعّر بعد: المركبات الأربع (سيارتا مرسيدس لنقل المطار وسيارتان كبيرتان للرحلات) إذا اعتُمد الشراء، وتجهيزات المطعم والمقهى والقاعة وكافيه السطح، والإيجار المدفوع مقدمًا، وما قبل الافتتاح، ورأس المال العامل. يُراجع نطاق عقد التعديلات مقابل تسعير التهيئة لتجنب ازدواج الحصر.</p>')+
 displaySection('حصر التكلفة الاستثمارية',['البند','التكلفة','من إجمالي الحصر','لكل متر مبني','لكل غرفة'],value.rows.concat([['إجمالي الحصر',base]]).map(([label,n])=>[
  esc(label),pm(n),returnPercent(n,base),pm(n/p.gross),pm(n/p.keys)
 ]))+
 displaySection('مقارنة السنة التشغيلية مع الاستثمار',['البند','سنوي','من الاستثمار','لكل غرفة سنويًا','لكل ليلة مباعة'],margin.map(([label,n])=>[
  label,pm(n),returnPercent(n,projectTotal),pm(n/p.keys),year.sold?pm(n/year.sold):'بانتظار إشغال'
 ]))+
 returnScenarioPanel(p)+
 panel('قراءة الاستثمار',row('مضاعف الاستثمار إلى الإيرادات',year.revenue?pn(projectTotal/year.revenue)+' مرة':'بانتظار إيراد')+
 row('متوسط سعر الليلة ADR',year.sold?pm(year.roomRevenue/year.sold):'بانتظار إشغال')+
 row('إيراد الغرفة المتاحة RevPAR',pm(year.roomRevenue/year.available))+
 row('مدة الاسترداد البسيطة بصافي الربح والإهلاك',year.net+year.depreciation>0?pn(projectTotal/(year.net+year.depreciation))+' سنة تقريبًا':'لا يتحقق الاسترداد ضمن التدفق السنوي المقدر')+
 '<p class="muted">العائد السنوي على التكلفة يقارن سنة واحدة بموازنة الاستثمار. الاسترداد مؤشر مبسّط يضيف الإهلاك إلى الربح ويستخدم سنة تشغيل مستقرة. عندما تكون تكلفة الأرض صفرًا فهي غير مدرجة. تشمل موازنة الاستثمار رأس المال العامل ولا تُحمّل قيمته على مصروفات التشغيل.</p>');
}
const adminFields=[
 ['year','سنة الإسقاط',2026,2100],['month','شهر العرض',1,12],['occupancy','الإشغال المخطط %',1,100],
 ['priceIndex','مستوى أسعار البيع %',25,400],['costIndex','المستوى العام لتكلفة التشغيل %',25,400],
 ['buildIndex','مستوى تكاليف الإنشاء %',25,400],['equipmentIndex','مستوى تكلفة التجهيز %',25,400]
];
const numberField=(name,label,value,min,max)=>'<label>'+esc(label)+'<input name="'+name+'" type="number" min="'+min+'" max="'+max+'" step="1" value="'+esc(value)+'" required></label>';
function controlCharts(p,annual) {
 const offsets=monthOffsets(preferences.year);
 const monthly=calendarMonths.map((name,i)=>[name,forecast(p,offsets[i],offsets[i+1]-offsets[i])]);
 const max=Math.max(1,...monthly.flatMap(([,f])=>[f.revenue,f.operating,Math.abs(f.net)]));
 const bar=(value,scale,style)=>'<i class="'+style+'" style="--width:'+Math.min(100,Math.max(0,Math.abs(value)/scale*100))+'%"></i>';
 const occupancies=[['اليوم','day'],['الشهر حتى اليوم','month'],['السنة حتى اليوم','year']].map(([name,period])=>{
  const data=salesPeriod(period);
  const measured=data.available?data.sold*100/data.available:0;
  return '<div class="chart-row"><strong>'+name+'</strong><div class="chart-track" aria-hidden="true">'+bar(measured,100,'chart-rev')+
   bar(preferences.occupancy,100,'chart-cost')+'</div><small>'+(data.available?percent(measured):'بانتظار قياس')+' / '+percent(preferences.occupancy)+'</small></div>';
 }).join('');
 return panel('الإشغال المقاس مقابل المستهدف','<div class="chart-legend">أخضر · سجل التشغيل <span>ذهبي · المستهدف</span></div>'+occupancies)+
 '<div class="split">'+panel('الإيراد والمصروفات شهريًا','<div class="chart-legend">أخضر · إيراد <span>ذهبي · مصروفات تشغيل</span></div>'+
 monthly.map(([month,f])=>'<div class="chart-row"><strong>'+esc(month)+'</strong><div class="chart-track" aria-hidden="true">'+bar(f.revenue,max,'chart-rev')+bar(f.operating,max,'chart-cost')+'</div><small>'+pm(f.revenue)+' / '+pm(f.operating)+'</small></div>').join(''))+
 panel('النتيجة ومكونات المصاريف السنوية',row('الإيرادات',pm(annual.revenue))+row('مجمل التشغيل GOP',pm(annual.gop))+row('صافي الربح',pm(annual.net))+
 Object.entries(annual.costs).sort((a,b)=>b[1]-a[1]).map(([key,n])=>'<div class="chart-row"><strong>'+costLabels[key]+'</strong><div class="chart-track" aria-hidden="true">'+bar(n,Math.max(1,annual.operating),'chart-rev')+'</div><small>'+pm(n)+'</small></div>').join(''))+'</div>';
}
let controlError='';
function adminPage(){
 const p=profile(), annual=forecast(p,0,daysInYear(preferences.year));
 const choices=Object.entries(scenarios).map(([key,x])=>[key,x.label]);
 const forms='<form id="master-form">'+panel('المنشأة والسعة والأسعار','<div class="plan-controls">'+choose('masterScenario','نوع المنشأة',choices,preferences.scenario)+
 '<div id="master-stars">'+starFields(preferences.scenario)+'</div>'+
 '<div id="master-capacity" class="plan-controls">'+capacityFields(preferences.scenario)+'</div>'+
 adminFields.map(([name,label,min,max])=>numberField(name,label,preferences[name]??100,min,max)).join('')+'</div>')+
 panel('مدخلات الاستثمار','<div id="master-capital" class="plan-controls">'+capitalFields(preferences.scenario)+'</div>')+
 panel('مدخلات التشغيل والتمويل','<div class="plan-controls">'+editableBudget.map(([key,label,min,max])=>numberField(key,label,budgetInputs[key],min,max)).join('')+'</div>')+
 '<p role="alert" class="control-error">'+esc(controlError)+'</p><button class="primary">اعتماد الإعدادات وتحديث المنصة</button></form>';
 return '<div class="heading"><div><h1>لوحة التحكم</h1><p class="muted">إعدادات التشغيل والموازنة والاستثمار · '+esc(p.label)+'</p></div>'+action('go','لوحة القيادة','dashboard')+'</div>'+
 controlCards([['الغرف والأجنحة',pn(p.keys)],['ليالي مباعة سنويًا',pn(annual.sold)],['الإيرادات السنوية',pm(annual.revenue)],['الاستثمار التقديري',pm(p.investmentEstimate)],['التمويل المستهدف',pm(p.fundingTarget)],['العائد السنوي الصافي',returnPercent(annual.net,p.investmentEstimate)]])+
 forms+'<p class="muted">السعة والأسعار والإشغال مدخلات تخطيطية قابلة للتعديل. يبدأ سجل التشغيل فارغًا وتُحفظ إدخالاته في هذا المتصفح.</p>'+
 classificationPanel()+controlCharts(p,annual)+dashboardDirectory();
}
function capacityFields(scenario){
 const settings={...preferences,scenario};
 const prices=settings.unitPrices?.[scenario]||[];
 return capacityMix(settings).map(([name,count,,,,baseBeds,basePrice],i)=>numberField('capacity'+i,'عدد · '+name,count,i===0?10:0,900)+
 numberField('unitPrice'+i,'السعر الأساسي · '+name,prices[i]??basePrice,1,100000)).join('');
}
document.addEventListener('change',event=>{
 if(event.target.name==='masterScenario'){
  $('master-stars').innerHTML=starFields(event.target.value);
  $('master-capacity').innerHTML=capacityFields(event.target.value);
  $('master-capital').innerHTML=capitalFields(event.target.value);
 }
});
document.addEventListener('submit',event=>{
 if(event.target.id!=='master-form')return;
 event.preventDefault();
 const form=new FormData(event.target), scenario=String(form.get('masterScenario'));
 const settings={...preferences,scenario};
 for(const [key] of adminFields) settings[key]=Number(form.get(key));
 settings.capitalByProperty={...preferences.capitalByProperty,[scenario]:Object.fromEntries(capitalInputs.map(([key])=>[key,Number(form.get(key))]))};
 const counts=[0,1,2].map(i=>Number(form.get('capacity'+i)));
 const prices=[0,1,2].map(i=>Number(form.get('unitPrice'+i)));
 settings.roomMix={...preferences.roomMix,[scenario]:counts};
 settings.unitPrices={...preferences.unitPrices,[scenario]:prices};
 try{
  const stars=Number(form.get('targetStars'));
  verify(stars===0||classificationReferences[scenario][1][stars-1]>0,'اختر تصنيفًا متاحًا لهذا النوع.');
  settings.classificationByProperty={...preferences.classificationByProperty,[scenario]:stars};
  verify(scenario!=='apartments'||(counts[0]+counts[1])*100>=51*total(counts),'يجب أن تشكّل الشقق 51% على الأقل من وحدات الضيافة.');
  verify(total(counts)>=20&&total(counts)<=900,'أدخل إجمالي سعة من 20 إلى 900 وحدة.');
  const stored=scenario===preferences.scenario?state:JSON.parse(localStorage.getItem(storageFor(scenario)));
  const resized=stored?updateRoomInventory(stored,capacityMix(settings)):null;
  Object.assign(budgetInputs,Object.fromEntries(editableBudget.map(([key])=>[key,Number(form.get(key))])));
  Object.assign(preferences,settings);
  localStorage.setItem(modelStorage,JSON.stringify(budgetInputs));
  localStorage.setItem(planStorage,JSON.stringify(preferences));
  if(stored){
   state={...stored,...resized};
   localStorage.setItem(chosenKey(),JSON.stringify(state));
   selectProperty();
  }else activateProperty();
  controlError='';
  render();notify('تم تحديث السعة والموازنة والمؤشرات المرتبطة');
 }catch(error){controlError=error.message;event.target.querySelector('[role=alert]').textContent=controlError;}
});
