'use strict';

const planningTitles = {
  sitePlan:'التخطيط والتحليل المساحي',
  staffingPlan:'الهيكل والرواتب والتعويضات',
  equipmentPlan:'التجهيزات والأثاث والمفروشات',
  constructionPlan:'أعمال التهيئة والتشطيبات',
  servicePlan:'الخدمات والأسعار والمبيعات',
  feasibility:'المؤشرات والنتائج التشغيلية'
};
const anam = {
 label:'فندق أنام للشقق الفندقية', location:'حي الحيلة الغربي · محايل عسير',
 land:635, floors:6, parkingSpaces:7, elevators:2,
 annualRent:350000, investmentEstimate:7500000, fundingTarget:5000000,
 fitoutEstimate:570100, furnishingEstimate:756000
};
const scenarios = {
 apartments:{...anam,rooms:[
  ['استوديو',5,26,4,0,2,170],['غرفة وصالة',20,44,5,0,2,230],
  ['غرفتان وصالة',10,65,6,0,4,340],['جناح VIP',2,79,7,0,4,430]
 ],halls:1,pool:0,landscape:0,parking:0,roads:0,sports:0,utilities:0,
 guestsPerKey:220,averageStay:2.5}
};
const hsuLink='https://www.hotelstars.eu/fileadmin/Dateien/PORTAL_HSU/Kriterienkataloge/2024-04-24_HSU_classification_criteria_2025_-_2030.pdf';
const hvsLink='https://hvs.com/StaticContent/9755/HVSWC-Navigating%20The%20Hospitality%20Investment%20Terrain-%20GCC%20development%20costs.pdf';
const adaLink='https://www.ada.gov/law-and-regs/design-standards/2010-stds/#224-transient-lodging-guest-rooms';
const resortPositions=[
 ['مشرف شاطئ ورحلات',1,6200],['مرشد أنشطة ورحلات',3,4200],['عامل شاطئ ومعدات',4,3100],
 ['منقذ شاطئ',4,3900],['سائق عربات المنتجع',3,3500],['فني ري ومسطحات مائية',2,4400]
];
const staffGroups = [
 ['الإدارة العامة','المالك / مجلس الإدارة',[
  ['المدير العام',1,22000],['مدير العمليات',1,14000],['مساعد تنفيذي',1,5200]]],
 ['الاستقبال والحجز','مدير العمليات',[
  ['مدير المكتب الأمامي',1,9600],['مشرف وردية',3,5300],['موظف استقبال',5,3900],['موظف حجز',2,4300],['مدقق ليلي',2,4500],['كونسيرج',2,4200],['حامل أمتعة',3,3200],['سائق نقل',2,3500]]],
 ['التدبير والمغسلة','مدير العمليات',[
  ['مدير التدبير',1,7800],['مشرف طوابق',2,4400],['عامل غرف',9,2900],['عامل مناطق عامة',3,2800],['مشرف بياضات',1,3900],['عامل مغسلة وكي',3,2800]]],
 ['الأغذية والمشروبات','مدير العمليات',[
  ['مدير أغذية ومشروبات',1,9500],['مدير منفذ',2,5900],['مشرف صالة',3,4400],['مضيف حجوزات',2,3500],['مقدم طعام',10,3200],['باريستا',3,3600],['موظف خدمة غرف',2,3300],['أمين صندوق',2,3700]]],
 ['المطابخ','مدير الأغذية والمشروبات',[
  ['شيف تنفيذي',1,10800],['شيف مساعد',1,7200],['رئيس قسم مطبخ',3,5100],['طاهٍ',5,3700],['خباز وحلواني',2,4300],['مساعد تحضير',4,2850],['عامل غسيل أوانٍ',4,2700]]],
 ['المبيعات والإيرادات','المدير العام',[
  ['مدير تجاري',1,10500],['أخصائي إيرادات وقنوات',1,6500],['مندوب مبيعات شركات',2,5300],['أخصائي تسويق رقمي',1,4800],['منسق فعاليات',2,4400],['فني صوتيات فعاليات',1,4100]]],
 ['المالية والمشتريات','المدير العام',[
  ['مدير مالي',1,11500],['محاسب عام',1,6000],['محاسب ذمم وصندوق',2,4800],['مراقب تكاليف',1,5100],['مسؤول مشتريات',1,5400],['أمين مستودع واستلام',2,3600]]],
 ['الهندسة وتقنية المعلومات','مدير العمليات',[
  ['رئيس الهندسة',1,9100],['فني كهرباء',2,4200],['فني تكييف',2,4400],['فني سباكة',1,3900],['فني أعمال عامة',2,3600],['أخصائي أنظمة وتقنية',1,6300],['عامل حدائق',2,2800]]],
 ['الموارد البشرية والجودة','المدير العام',[
  ['مدير موارد بشرية',1,8400],['منسق رواتب وتدريب',1,4800],['مسؤول جودة وسلامة غذاء',1,5200],['مسؤول تراخيص وعقود',1,5000]]],
 ['الأمن والسلامة','مدير العمليات',[
  ['رئيس أمن',1,6300],['مشرف أمن',2,4500],['حارس ومراقب كاميرات',6,3300],['مسعف وردية',2,4600]]],
 ['السبا والترفيه','مدير العمليات',[
  ['مشرف سبا وأنشطة',1,5900],['معالج سبا',3,4200],['مدرب لياقة',1,4200],['منقذ مسبح',3,3600],['منشط أطفال ورياضة',2,3400],['مضيف حجوزات ومرافق',1,3300]]]
];
// Prices are planning assumptions in SAR. Each service uses one explicit demand driver.
const serviceCatalog = [
 ['المطعم الرئيسي','بوفيه إفطار','ضيف',32,35,35,4],
 ['المطعم الرئيسي','غداء','وجبة',48,14,37,4],
 ['المطعم الرئيسي','عشاء','وجبة',55,18,37,4],
 ['مقهى اللوبي','قهوة وحلويات','طلب',25,30,35,6],
 ['النقل والرحلات','نقل المطار باتجاه واحد','رحلة',230,3,65,0],
 ['النقل والرحلات','جولة سياحية محلية','جولة',480,2,70,0],
 ['القاعات','حجز قاعة اجتماعات','حجز',600,0,35,0],
 ['كافيه السطح','طلب من كافيه السطح','طلب',30,0,40,0]
];
const proposedServices = [
 ['قاعة الاجتماعات','التشغيل والسعة بانتظار التحقق'],
 ['كافيه السطح','توسعة مقترحة'],
 ['نقل المطار','سيارتان مقترحتان · إيراد وتكلفة تخطيطيان'],
 ['الرحلات السياحية','سيارتان كبيرتان مقترحتان · إيراد وتكلفة تخطيطيان']
];
const planStorage='anam-planning-1';
const preferences={scenario:'apartments',year:2027,month:1,occupancy:60,priceIndex:100,costIndex:100,buildIndex:100,equipmentIndex:100,...JSON.parse(localStorage.getItem(planStorage)||'{}')};
const total=(rows, project=x=>x)=>rows.reduce((sum,x,i)=>sum+project(x,i),0);
const nearest=(value,step=10)=>Math.round(value/step)*step;

function profile(settings=preferences) {
 const baseline=scenarios[settings.scenario];
 const mix=capacityMix(settings);
 const keys=total(mix,x=>x[1]), ratio=keys/total(baseline.rooms,x=>x[1]);
 const venues=venuesFor(keys,settings.scenario);
 const source={...baseline,venues,outlets:venues.length,restaurants:venues.length-1};
 for(const key of ['pool','landscape','parking','roads','sports','utilities']) source[key]=Math.round(source[key]*ratio);
 const beds=total(mix,x=>x[1]*x[5]);
 const prices=settings.unitPrices?.[settings.scenario]||[];
 const units=mix.map(([name,count,net,bath,terrace,beds,price],i)=>({name,count,net,bath,terrace,beds,price:Math.round((prices[i]??price)*settings.priceIndex/100)}));
 const guestArea=total(units,x=>x.count*(x.net+x.bath));
 const terraceArea=total(units,x=>x.terrace*x.count);
 const isResort=settings.scenario==='resort';
 const isApartment=settings.scenario==='apartments';
 const scale=1;
 const layout=[
  ['استقبال وبهو',65,'خدمات الضيوف',1],
  ['ممرات وسلالم ومصاعد',295,'حركة رأسية وأفقية',source.floors],
  ['مواقف وخدمات البدروم',380,'خلفية وتشغيل',1],
  ['مخازن وتدبير وإدارة',95,'خلفية وتشغيل',1],
  ['خدمات وجدران وفراغات إنشائية',175,'إنشائي',source.floors],
  ...venues.map(x=>[x.name,x.area,'خدمات الضيوف',1])
 ];
 const common=layout.map(([name,area,use,count])=>({name,area:Math.round(area*scale),use,count}));
 const commonArea=total(common,x=>x.area);
 const gross=guestArea+commonArea;
 const footprint=380.8;
 const used=footprint+source.pool+source.landscape+source.parking+source.roads+source.sports+source.utilities;
 const exterior=[
  ['مبانٍ مسقوفة',footprint],['مسطحات حمامات السباحة',source.pool],['لاند سكيب وحدائق',source.landscape],['مواقف سيارات',source.parking],
  ['طرق وممرات خارجية',source.roads],['ملاعب وترفيه مفتوح',source.sports],['مرافق وشبكات وساحات خدمة',source.utilities],['ارتدادات وساحات وأرض احتياطية',source.land-used]
 ];
 return {...source,isResort,isApartment,classification:classificationLabel(settings),keys,beds,units,guestArea,terraceArea,common,commonArea,gross,footprint,exterior,
  expectedGuests:keys*settings.occupancy/100*source.guestsPerKey/100};
}

const anamStaffGroups=[
 ['الإدارة','الإدارة', [['مدير الفندق',1,8500]]],
 ['الاستقبال والحجز','مدير الفندق',[['موظف استقبال سعودي',4,4600]]],
 ['التدبير والمغسلة','مدير الفندق',[['عامل غرف',6,2500]]],
 ['الأغذية والمشروبات','مدير الفندق',[['مقدم طعام',3,3000],['باريستا',2,3300]]],
 ['المطابخ','مدير الفندق',[['طاهٍ',2,4500],['مساعد تحضير',2,2800],['عامل غسيل أوانٍ',1,2400]]],
 ['الصيانة','مدير الفندق',[['فني أعمال عامة',1,3800]]]
];
function staffing(p,settings=preferences) {
 return anamStaffGroups.flatMap(([department,reports,basePositions])=>{
   const positions=p.isApartment?basePositions.filter(([title])=>!['معالج سبا','منقذ مسبح'].includes(title)):p.isResort&&department==='السبا والترفيه'?basePositions.concat(resortPositions):basePositions;
   return positions.map(([title,baseCount,reference],i)=>{
   const count=baseCount;
   const tier=i===0?'قيادة القسم':/مدير|مشرف|رئيس|شيف/.test(title)?'إشراف':'تشغيل وتخصص';
   const supervisor=positions.slice(1,i).reverse().find(([name])=>/مدير|مشرف|رئيس|شيف/.test(name));
   const base=nearest((budgetInputs.salaryPrices[title]??reference)*settings.costIndex/100,1);
   const housing=Math.round(base*0.15), transport=Math.round(base*0.08), incentive=Math.round(base*0.05);
   const benefits=420+Math.round(base*0.12);
   const person=base+housing+transport+incentive+benefits;
      return {department,reports:i===0?reports:tier==='إشراف'?positions[0][0]:supervisor?.[0]||positions[0][0],level:tier,title,count,base,reference,housing,transport,incentive,benefits,person,monthly:person*count};
  });
 });
}

function equipment(p,settings=preferences) {return revisedEquipment(p,settings);}
const constructionTrades=[
 ['حفر وردم وأعمال تأسيس',260,420],['قواعد وخرسانة وحديد',660,780],['مبانٍ وقواطع وعزل',420,480],
 ['واجهات وأبواب ونوافذ',430,520],['أرضيات وأسقف ودهانات ثابتة',530,645],['تكييف وتهوية وتحكم',420,510],
 ['إنارة وتمديدات كهرباء وبيانات',350,410],['سباكة ومياه وصرف',290,340],['إطفاء وإنذار',135,160]
];
function construction(p,settings=preferences) {
 const rows=[];
 const push=(packageName,scope,unit,qty,base)=>{
  const ref=packageName+' · '+scope;
  const reference=budgetInputs.constructionPrices[ref]??base;
  rows.push({packageName,scope,unit,qty,reference,ref,rate:Math.round(reference*(settings.buildIndex??100)*settings.costIndex/10000)});
 };
 push('تعديلات وتشطيبات وتجهيزات ثابتة','المبنى القائم','حزمة',1,anam.fitoutEstimate);
 return rows;
}
const calendarMonths=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const daysInMonth=(year,month)=>new Date(Date.UTC(year,month,0)).getUTCDate();
const daysInYear=year=>daysInMonth(year,2)===29?366:365;
// Allocate integer transactions by cumulative quantities so every period reconciles.
const between=(daily,offset,days)=>Math.round((offset+days)*daily)-Math.round(offset*daily);
function forecast(p,offset,days,settings=preferences) {
 const {sold,revenue:roomRevenue,fees:distribution}=commercialRoomForecast(p,offset,days,settings);
 const guests=between(p.expectedGuests,offset,days);
 const periodDays=daysInYear(settings.year);
 const services=serviceCatalog.filter(x=>serviceEnabled(x,p)).map(([category,name,unit,raw,attach,cost,external])=>{
   const fixedMonth=/شهر كشك/.test(unit);
   const monthlyBooking=/حجز/.test(unit)&&category==='القاعات';
   const externalDemand=category==='القاعات'?budgetInputs.hallBookingsMonthly:
    category==='كافيه السطح'?budgetInputs.rooftopOrdersDaily:serviceExternal(category,external,p);
   const base=(fixedMonth||monthlyBooking?externalDemand*12/periodDays:externalDemand)+p.expectedGuests*attach/100;
   const price=Math.round((budgetInputs.servicePrices[name]??raw)*settings.priceIndex/100);
   const quantity=between(base,offset,days);
   return {category,name,unit,price,quantity,revenue:quantity*price,cost:quantity*Math.round(price*cost/100),variable:cost,driver:[attach?attach+'% من الضيوف':'',externalDemand?externalDemand+' '+(fixedMonth?'عقود / شهر':monthlyBooking?'حجوزات / شهر':'طلب خارجي / يوم'):''].filter(Boolean).join(' + ')};
 });
 const serviceRevenue=total(services,x=>x.revenue);
 const wages=between(total(staffing(p,settings),x=>x.monthly)*12/periodDays,offset,days);
 const roomCost=sold*standardRoomCost(settings);
 const servicesCost=total(services,x=>x.cost);
 const revenue=roomRevenue+serviceRevenue;
 const financial=detailedOperatingCosts(p,offset,days,settings,{sold,revenue,roomCost,servicesCost,distribution,wages});
 return {days,sold,available:p.keys*days,guests,bookings:between(p.keys*settings.occupancy/100/p.averageStay,offset,days),roomRevenue,serviceRevenue,revenue,wages,roomCost,servicesCost,distribution,services,...financial};
}

const nfmt = new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
const pn = x=>nfmt.format(x);
const pm = x=>pn(x)+' ر.س';
const percent = x=>pn(x)+'%';
const asArea = x=>pn(x)+' م²';
const displaySection = (label,heads,rows)=>panel(label,table(heads,rows));
const sumArea=(p,room)=>room.net+room.bath+(p.commonArea/p.keys)+room.terrace;
const monthOffsets=year=>calendarMonths.reduce((offsets,_,i)=>offsets.concat(offsets[i]+daysInMonth(year,i+1)),[0]);

function planningControls() {
 const option=(value,label,current)=>'<option value="'+esc(value)+'" '+(value===current?'selected':'')+'>'+esc(label)+'</option>';
 const makeInput=(name,label,min,max)=>'<label>'+label+'<input name="'+name+'" type="number" inputmode="numeric" min="'+min+'" max="'+max+'" step="1" value="'+esc(preferences[name])+'" required></label>';
 return '<form class="panel plan-controls" id="plan-controls"><label>نوع المنشأة<select name="scenario">'+Object.entries(scenarios).map(([key,p])=>option(key,p.label,preferences.scenario)).join('')+'</select></label>'+
  '<label>شهر عرض التفاصيل اليومية<select name="month">'+calendarMonths.map((m,i)=>option(i+1,m,preferences.month)).join('')+'</select></label>'+
  makeInput('year','سنة الإسقاط',2026,2100)+makeInput('occupancy','الإشغال %',1,100)+
  makeInput('priceIndex','معامل أسعار البيع %',25,400)+makeInput('costIndex','معامل تكاليف التوريد %',25,400)+
  '<button class="primary">تطبيق الافتراضات</button></form>';
}

function sitePlanView(p) {
 return '<div class="cards">'+[
  card('مساحة الأرض',asArea(p.land)),card('وحدات الضيافة المخططة',pn(p.keys)),
  card('المواقف المخططة',pn(p.parkingSpaces)),card('المصاعد',pn(p.elevators))
 ].join('')+'</div>'+
 panel('الموقع وتوزيع المبنى',row('الموقع',esc(p.location))+
  row('الأدوار','بدروم وستة أدوار وملحق')+row('الأرضي','استقبال ومطعم ومقهى')+
  row('البدروم','مواقف وخدمات · قاعة اجتماعات مقترحة')+
  row('وصف العقار في عقد الإيجار','42 وحدة عقارية تشمل استخدامات متعددة')+
  row('فترة الإيجار','13 يناير 2024 إلى 30 أغسطس 2038')+
  row('دورية الإيجار','دفعات نصف سنوية'))+
 displaySection('برنامج الوحدات',['النوع','العدد المخطط','السعة التقديرية للوحدة','سعر الليلة التخطيطي'],
  p.units.map(x=>[esc(x.name),pn(x.count),pn(x.beds),pm(x.price)]))+
 displaySection('خدمات قيد الدراسة',['الخدمة','الحالة'],proposedServices)+panel('افتراض تشغيل النقل والرحلات','<p>تتضمن الموازنة تكلفة تقديم الخدمة والمركبة والسائق ضمن تكلفة الرحلة. يتضمن برنامج الخدمة سيارتين لنقل المطار وسيارتين كبيرتين للرحلات. تُراجع تكاليف اقتناء المركبات ضمن الاستثمار عند اعتماد خيار الشراء. تبدأ خطة القاعة وكافيه السطح بصفر طلبات، ويمكن تفعيل الإيراد من مدخلات التشغيل بعد تحديد السعة والجدوى.</p>')+classificationPanel();
}


function staffingView(p) {
 const rows=staffing(p);
 const wages=total(rows,x=>x.monthly);
 const work=workloadTargets(p);
 return '<div class="cards">'+[card('الأقسام',pn(anamStaffGroups.length)),card('المسميات الوظيفية',pn(rows.length)),card('قوة العمل',pn(total(rows,x=>x.count))),card('التعويض الشهري الكامل',pm(wages)),card('التعويض السنوي',pm(wages*12))].join('')+'</div>'+
 panel('أساس تغطية التشغيل',row('الغرف المشغولة المخططة',pn(work.occupied))+row('الوجبات والتغطيات المتوقعة يوميًا',pn(work.covers))+row('المطاعم والمقهى',pn(p.restaurants)+' مطاعم ومقهى')+row('طهاة الخطوط قبل الشيفات والمساعدين',pn(work.cooks))+row('غرف المغادرة المتوقعة يوميًا',pn(work.departures)))+
 displaySection('ملخص الملاك الوظيفي حسب الإدارة',['الإدارة','الموظفون','الأساسي شهريًا','البدلات والحوافز والمنافع','إجمالي شهري','إجمالي سنوي'],anamStaffGroups.map(([name])=>{
   const r=rows.filter(x=>x.department===name);
   const monthly=total(r,x=>x.monthly);
   const base=total(r,x=>x.base*x.count);
   return [name,pn(total(r,x=>x.count)),pm(base),pm(monthly-base),pm(monthly),pm(monthly*12)];
 }))+displaySection('التسلسل الإشرافي والتعويضات حسب المنصب',['القسم','المنصب','المستوى','يتبع','العدد','أساسي / فرد','سكن','نقل','حوافز','منافع وتأمينات','إجمالي / فرد','تكلفة شهرية','تكلفة سنوية','المدخل'],rows.map(x=>[x.department,x.title,x.level,x.reports,pn(x.count),...[x.base,x.housing,x.transport,x.incentive,x.benefits,x.person,x.monthly,x.monthly*12].map(pm),budgetButton('salaryPrices',x.title,budgetInputs.salaryPrices[x.title]??x.reference)]))+
 panel('افتراض التعويضات','<p>سكن 15%، نقل 8%، حافز 5%، ومخصص منافع وتأمينات 12% من الأساسي و420 ريالًا للفرد شهريًا. تُراجع الرواتب السوقية حسب الخبرة ونوع الفندق. استُخدم دليل محلي لوظائف الإدارة والاستقبال والطهي وإعلان لشيف القسم، وباقي المسميات والبدلات افتراضات تعويض قابلة للتعديل. المخصص جزء من تكلفة صاحب العمل في الموازنة.</p><p><a href="'+wageGuide+'">دليل الرواتب السعودي 2026</a> · <a href="'+wageBenchmarks+'">مرجع وظائف التشغيل</a> · <a href="'+jobGuide+'">إعلان شيف قسم في الرياض</a></p>');
}
function equipmentView(p) {
 const rows=equipment(p);
 const categories=Array.from(new Set(rows.map(x=>x.zone)));
 return '<div class="cards">'+[card('بنود الحصر',pn(rows.length)),card('المناطق المشمولة',pn(categories.length)),card('إجمالي التجهيزات',pm(total(rows,x=>x.quantity*x.price)))].join('')+'</div>'+
 displaySection('ميزانية التجهيزات حسب المنطقة',['القسم','البنود','الكمية','التكلفة'],categories.map(zone=>{
  const r=rows.filter(x=>x.zone===zone);
  return [esc(zone),pn(r.length),pn(total(r,x=>x.quantity)),pm(total(r,x=>x.quantity*x.price))];
 }))+panel('الحصر التفصيلي القابل للبحث','<label>ابحث في الأصناف والأقسام<input type="search" id="plan-equipment-search" placeholder="مثل أثاث أو مطبخ"></label><div id="plan-equipment-results">'+equipmentTable(rows)+'</div>')+
 panel('تقدير الأسعار والكميات','<p>يشمل الحصر تأثيث الوحدات وتجهيز مطابخها. يؤثر تعديل الأسعار في موازنة التأثيث والإهلاك ومخصص الصيانة. تُقدّر تجهيزات المطعم والمقهى وبنود الافتتاح عند استكمال الحصر.</p>');
}
function equipmentTable(rows) {
 return table(['الموقع','الصنف','الكمية','السعر المعلن شامل الضريبة','سعر الوحدة للموازنة','الإجمالي','درجة التحقق','المصدر','الإجراء'],rows.map(x=>[
  esc(x.zone),esc(x.name),pn(x.quantity),x.listPrice?pm(x.listPrice):'حسب التوريد',pm(x.price),pm(x.price*x.quantity),badge(x.status,x.status==='يتطلب عرض توريد'),
  x.url?'<a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.source)+'</a>':esc(x.source),
  budgetButton('equipmentPrices',x.sku,budgetInputs.equipmentPrices[x.sku]??Math.round(x.price*10000/(preferences.costIndex*preferences.equipmentIndex)))
 ]));
}
function constructionView(p) {
 const rows=construction(p);
 const direct=total(rows,x=>x.qty*x.rate);
 const {design:soft,contingency:reserve}=investment(p);
 const constructionCost=direct+soft+reserve;
 return '<div class="cards">'+[card('الأعمال المباشرة',pm(direct)),card('هندسة وإشراف',pm(soft)),card('احتياطي',pm(reserve)),card('إجمالي موازنة التهيئة',pm(constructionCost))].join('')+'</div>'+
 displaySection('ملخص التكلفة الإنشائية حسب الموقع',['الموقع','عدد الأعمال','تكلفة الأعمال المباشرة'],Array.from(new Set(rows.map(x=>x.scope))).map(scope=>{
  const inScope=rows.filter(x=>x.scope===scope);
  return [scope,pn(inScope.length),pm(total(inScope,x=>x.qty*x.rate))];
 }))+displaySection('بنود الكميات والأسعار للمباني والموقع',['الموقع','البند','الوحدة','الكمية','سعر الوحدة','الإجمالي','الموازنة'],rows.map(x=>[x.scope,x.packageName,x.unit,pn(x.qty),pm(x.rate),pm(x.qty*x.rate),budgetButton('constructionPrices',x.ref,x.reference)]))+
 panel('حدود الموازنة',row('إجمالي الإنشاء لكل مفتاح',pm(constructionCost/p.keys))+row('إجمالي الإنشاء والتجهيزات',pm(constructionCost+total(equipment(p),x=>x.quantity*x.price)))+
 '<p>الموازنة تخص تهيئة المبنى القائم. تخضع للتسوية بعد حصر الأعمال المنفذة والمتبقية.</p>');
}
function periodFor(p) {
 const year=preferences.year, month=preferences.month, offsets=monthOffsets(year);
 return {annual:forecast(p,0,offsets[12]),month:forecast(p,offsets[month-1],offsets[month]-offsets[month-1]),day:forecast(p,offsets[month-1],1),offsets};
}
function feasibilityView(p) {
 const {annual:y,month:m,day:d,offsets}=periodFor(p);
 const metrics=[
 ['ليالي متاحة',x=>pn(x.available)],['ليالي مباعة',x=>pn(x.sold)],['الإشغال',x=>percent(x.sold/x.available*100)],
 ['زيارات ضيوف مبيتين',x=>pn(x.guests)],['حجوزات وصول',x=>pn(x.bookings)],['عمليات خدمات',x=>pn(total(x.services,s=>s.quantity))],
 ['إيراد الليالي',x=>pm(x.roomRevenue)],['إيراد الخدمات',x=>pm(x.serviceRevenue)],['إجمالي الإيراد',x=>pm(x.revenue)],
 ['الأجور والتعويضات',x=>pm(x.wages)],['تكاليف الإشغال المباشرة',x=>pm(x.roomCost)],['تكلفة الإشغال لكل ليلة · CPOR',x=>x.sold?pm(x.roomCost/x.sold):'بانتظار بيع'],['نسبة تكلفة الإشغال إلى إيراد الغرف',x=>salesCosts(x)],['تكاليف تقديم الخدمات',x=>pm(x.servicesCost)],
 ['التوزيع والعمولات',x=>pm(x.distribution)],['المرافق والإدارة والصيانة',x=>pm(x.overhead)],['إجمالي مصروفات التشغيل',x=>pm(x.operating)],
 ['الربح التشغيلي التقديري',x=>pm(x.gop)],['صافي الربح وفق المدخلات',x=>pm(x.net)],['هامش التشغيل',x=>x.revenue?percent(x.gop/x.revenue*100):'0%'],['ADR',x=>x.sold?pm(x.roomRevenue/x.sold):'0 ر.س'],['RevPAR',x=>pm(x.roomRevenue/x.available)],['TRevPAR',x=>pm(x.revenue/x.available)],['GOPPAR',x=>pm(x.gop/x.available)]
 ];
 const pv=(label,x)=>[label,pn(x.days),pn(x.sold),pn(x.guests),pn(x.bookings),pn(total(x.services,s=>s.quantity)),pm(x.roomRevenue),pm(x.serviceRevenue),pm(x.revenue),pm(x.operating),pm(x.gop)];
 const heads=['الفترة','الأيام','ليالي مباعة','ضيوف','حجوزات','خدمات','غرف','خدمات بالريال','إيراد','تكلفة','ربح تشغيلي'];
 const yStr=String(preferences.year), mStr=String(preferences.month).padStart(2,'0');
 return '<div class="cards">'+[card('الإشغال المخطط',percent(preferences.occupancy)),card('إيراد السنة',pm(y.revenue)),card('الربح التشغيلي السنوي',pm(y.gop)),card('إيراد الغرف لكل غرفة متاحة',pm(y.roomRevenue/y.available))].join('')+'</div>'+
 displaySection('المؤشرات المجمعة',['المؤشر','أول يوم في الشهر','متوسط يوم سنوي','الشهر المختار','السنة'],metrics.map(([label,show])=>{
  const avg={...y,available:y.available/y.days,sold:y.sold/y.days,guests:y.guests/y.days,bookings:y.bookings/y.days,services:y.services.map(x=>({...x,quantity:x.quantity/y.days}))};
  for(const key of ['roomRevenue','serviceRevenue','revenue','wages','roomCost','servicesCost','distribution','overhead','operating','gop','net']) avg[key]/=y.days;
  return [label,show(d),show(avg),show(m),show(y)];
 }))+displaySection('التفصيل الشهري',heads,calendarMonths.map((month,i)=>pv(month,forecast(p,offsets[i],offsets[i+1]-offsets[i]))))+
 displaySection('التفصيل اليومي للشهر المختار',heads,Array.from({length:m.days},(_,i)=>pv(yStr+'-'+mStr+'-'+String(i+1).padStart(2,'0'),forecast(p,offsets[preferences.month-1]+i,1))))+
 panel('الافتراضات المالية','<p>التوقعات تفترض إشغالًا ثابتًا وإقامة متوسطة '+pn(p.averageStay*10)+' ليالي لكل 10 حجوزات. تطبق توقعات الغرف أسعار المواسم ونهاية الأسبوع ومزيج القنوات والعمولات المبينة في صفحة أسعار الغرف والإيرادات، مع عرض عمولات التوزيع منفصلة. يشمل الربح التشغيلي المرافق والإدارة والتوزيع وتكاليف التشغيل، قبل التمويل والإهلاك والضرائب.</p>');
}
const planningViews={sitePlan:sitePlanView,staffingPlan:staffingView,equipmentPlan:equipmentView,constructionPlan:constructionView,feasibility:feasibilityView};
function renderPlanning(name) {
 return '<div class="heading"><div><h1>'+planningTitles[name]+'</h1><p class="muted">دراسة تطوير وتشغيل · افتراضات بالريال السعودي</p></div><button class="outline" id="export-plan">تصدير الدراسة</button></div>'+planningControls()+planningViews[name](profile());
}
document.addEventListener('submit',event=>{
 if(event.target.id!=='plan-controls') return;
 event.preventDefault();
 const data=Object.fromEntries(new FormData(event.target));
 const year=Number(data.year),month=Number(data.month),occupancy=Number(data.occupancy),priceIndex=Number(data.priceIndex),costIndex=Number(data.costIndex);
 Object.assign(preferences,{scenario:data.scenario,year,month,occupancy,priceIndex,costIndex});
 localStorage.setItem(planStorage,JSON.stringify(preferences));
 render();
 notify('تم تحديث السيناريو والمؤشرات');
});
document.addEventListener('input',event=>{
 if(event.target.id!=='plan-equipment-search') return;
 const terms=event.target.value.trim().toLowerCase();
 $('plan-equipment-results').innerHTML=equipmentTable(equipment(profile()).filter(x=>[x.name,x.zone,x.category].join(' ').toLowerCase().includes(terms)));
});
document.addEventListener('click',event=>{
 if(event.target.id!=='export-plan') return;
 const p=profile(), {annual,month,offsets}=periodFor(p);
 const months=calendarMonths.map((name,i)=>({name,...forecast(p,offsets[i],offsets[i+1]-offsets[i])}));
 const days=Array.from({length:annual.days},(_,i)=>({date:new Date(Date.UTC(preferences.year,0,i+1)).toISOString().slice(0,10),...forecast(p,i,1)}));
 const data={assumptions:preferences,property:p,staff:staffing(p),equipment:equipment(p),construction:construction(p),annual,month,months,days};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 const link=document.createElement('a');
 link.href=url;
 link.download='anam-plan-'+preferences.scenario+'-'+preferences.year+'.json';
 link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});
