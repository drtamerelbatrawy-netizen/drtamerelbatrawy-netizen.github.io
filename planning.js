'use strict';

const planningTitles = {
  sitePlan:'التخطيط والتحليل المساحي',
  staffingPlan:'الهيكل والرواتب والتعويضات',
  equipmentPlan:'التجهيزات والأثاث والمفروشات',
  constructionPlan:'التكاليف الإنشائية',
  servicePlan:'الخدمات والأسعار والمبيعات',
  feasibility:'المؤشرات والنتائج التشغيلية'
};
const scenarios = {
  apartments:{label:'شقق إيوان الفندقية',land:4800,floors:6,rooms:[
    ['شقة غرفة نوم',48,42,6,0,2,410],['شقة غرفتي نوم',24,61,8,5,4,630],['غرفة ضيافة',8,24,5,0,2,290]
  ],halls:1,pool:0,landscape:430,parking:1450,roads:420,sports:0,utilities:240,guestsPerKey:215,accessible:5,averageStay:5,benchmark:0,roomBenchmark:'بحسب تكوين الوحدة'},
  hotel:{label:'فندق إيوان · الرياض',land:14800,floors:7,rooms:[
    ['قياسية',160,26,6,0,2,510],['جناح',36,43,9,4,3,790],['جناح تنفيذي',4,60,11,8,4,1190]
  ], halls:3,restaurants:4,outlets:5,pool:465,landscape:2950,parking:5100,roads:1850,sports:620,utilities:700,guestsPerKey:175,accessible:8,averageStay:2.3,benchmark:85,roomBenchmark:'30–36'},
  resort:{label:'منتجع إيوان',land:36400,floors:2,rooms:[
    ['غرفة منتجع',82,40,9,8,2,680],['جناح منتجع',38,55,11,12,3,1040],['فيلا منتجع',20,86,16,18,5,1750]
  ], halls:4,restaurants:4,outlets:5,pool:2600,landscape:10900,parking:2100,roads:4900,sports:2700,utilities:1850,guestsPerKey:220,accessible:7,averageStay:3,staffScale:1.7,benchmark:210,roomBenchmark:'55–80'}
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
 ['المطعم الرئيسي','بوفيه إفطار','ضيف',70,54,34,25], ['المطعم الرئيسي','غداء','وجبة',105,23,35,38], ['المطعم الرئيسي','عشاء','وجبة',140,28,36,35],
 ['مطعم التخصصات','وجبة حسب القائمة','وجبة',155,16,36,31],['مطعم المشويات','وجبة مشويات كاملة','وجبة',128,18,35,37],['خدمة الغرف','وجبة خدمة الغرف','وجبة',105,15,34,0],['مقهى اللوبي','قهوة وحلويات','طلب',38,43,34,32],
 ['مطعم المسبح','وجبة خفيفة','طلب',55,25,38,17],['المشروبات','عصائر ومشروبات باردة','طلب',24,33,30,18],
 ['الميني بار','مشتريات الميني بار','طلب',48,15,48,0],['المطبخ','تقديم طعام للاجتماع','غطاء',125,0,45,24],
 ['القاعات','قاعة اجتماعات نصف يوم','حجز',1800,0,20,12],['القاعات','قاعة مناسبات يوم كامل','حجز',4800,0,25,6],
 ['القاعات','صوتيات وشاشة','حجز',480,0,18,8],['خدمات الأعمال','طباعة واجتماع خاص','طلب',45,7,20,0],
 ['السبا','جلسة تدليك','جلسة',245,7,29,5],['السبا','جلسة ساونا','زيارة',90,7,21,8],
 ['العناية','حلاقة وتجميل','جلسة',110,4,39,4],['النادي','دخول يومي لغير المقيمين','زيارة',85,0,18,18],
 ['المسبح','تذكرة دخول لغير المقيمين','زيارة',95,0,25,18],['المسبح','حجز كابانا','حجز',225,4,19,5],
 ['الأنشطة','تنس أو ملعب','ساعة',120,6,19,6],['الأنشطة','نادي الأطفال','جلسة',65,6,25,4],
 ['الأنشطة','تأجير دراجات','ساعة',45,3,22,4],['الأنشطة','عرض ترفيهي','تذكرة',60,4,36,10],
 ['النقل','نقل المطار','رحلة',175,4,54,0],['النقل','رحلة محلية','رحلة',95,5,50,0],
 ['المغسلة','غسيل وكي باقة','طلب',65,7,31,0],['التجزئة','هدايا ومستلزمات','طلب',85,9,61,6],
 ['التجزئة','إيجار كشك تجاري','شهر كشك',4200,0,12,3],
 ['الشاطئ','دخول يومي لغير المقيمين','زيارة',130,0,27,22,true],['الشاطئ','تأجير معدات شاطئية','جلسة',120,9,31,10,true],
 ['الرحلات','رحلة بإشراف منظم','فرد',195,7,58,8,true],['المطاعم','تجربة عشاء شاطئي','وجبة',215,8,42,8,true],
 ['المنتجع','دخول شاطئ ومسبح للمقيم','زيارة مشمولة',0,55,0,0,true],['المسبح','دخول أساسي للمقيم','زيارة مشمولة',0,40,0,0]
];
const planStorage='iwan-feasibility-1';
const preferences={scenario:'hotel',year:2027,month:1,occupancy:60,priceIndex:100,costIndex:100,buildIndex:100,equipmentIndex:100,...JSON.parse(localStorage.getItem(planStorage)||'{}')};
const total=(rows, project=x=>x)=>rows.reduce((sum,x,i)=>sum+project(x,i),0);
const nearest=(value,step=10)=>Math.round(value/step)*step;

function profile(settings=preferences) {
 const baseline=scenarios[settings.scenario];
 const mix=capacityMix(settings);
 const keys=total(mix,x=>x[1]), ratio=keys/total(baseline.rooms,x=>x[1]);
 const venues=venuesFor(keys,settings.scenario);
 const source={...baseline,venues,outlets:venues.length,restaurants:venues.length-1};
 for(const key of ['land','pool','landscape','parking','roads','sports','utilities']) source[key]=Math.round(source[key]*ratio);
 const beds=total(mix,x=>x[1]*x[5]);
 const prices=settings.unitPrices?.[settings.scenario]||[];
 const units=mix.map(([name,count,net,bath,terrace,beds,price],i)=>({name,count,net,bath,terrace,beds,price:Math.round((prices[i]??price)*settings.priceIndex/100)}));
 const guestArea=total(units,x=>x.count*(x.net+x.bath));
 const terraceArea=total(units,x=>x.terrace*x.count);
 const isResort=settings.scenario==='resort';
 const isApartment=settings.scenario==='apartments';
 const scale=(isResort?1.38:isApartment?0.48:1)*ratio;
 const layout=[
  ['بهو واستقبال وأمتعة وكونسيرج',530,'خدمات الضيوف',4],
  ['ممرات غرف وممرات خدمة وحركة رأسية',3050,'حركة رأسية وأفقية',source.floors],
  ['قاعات واجتماعات وبهو تجهيز',1040,'خدمات الضيوف',source.halls],
  [isApartment?'صالة نزلاء وخدمات إقامة ممتدة':'النادي والسبا وغرف تبديل',isApartment?360:860,'خدمات الضيوف',isApartment?2:6],
  ['المطبخ المركزي والمخبز والتبريد والاستلام الغذائي',740,'خلفية وتشغيل',5],
  ['خطوط إنهاء المطاعم وغسيل محلي',440,'خلفية وتشغيل',source.restaurants],
  ['مغسلة ومخازن وتدبير',750,'خلفية وتشغيل',5],
  ['إدارة ومرافق عاملين وأمن',690,'خلفية وتشغيل',8],
  ['محطات ميكانيكية وكهرباء وتقنية',1090,'خلفية وتشغيل',7],
  ['جدران وفراغات إنشائية',1270,'إنشائي',source.floors],
  ...venues.map(x=>[x.name,x.area,'خدمات الضيوف',1])
 ];
 const common=layout.map(([name,area,use,count])=>({name,area:Math.round(area*scale),use,count}));
 const commonArea=total(common,x=>x.area);
 const gross=guestArea+commonArea;
 const footprint=Math.ceil(gross/source.floors);
 const used=footprint+source.pool+source.landscape+source.parking+source.roads+source.sports+source.utilities;
 const exterior=[
  ['مبانٍ مسقوفة',footprint],['مسطحات حمامات السباحة',source.pool],['لاند سكيب وحدائق',source.landscape],['مواقف سيارات',source.parking],
  ['طرق وممرات خارجية',source.roads],['ملاعب وترفيه مفتوح',source.sports],['مرافق وشبكات وساحات خدمة',source.utilities],['ارتدادات وساحات وأرض احتياطية',source.land-used]
 ];
 return {...source,isResort,isApartment,classification:classificationLabel(settings),keys,beds,units,guestArea,terraceArea,common,commonArea,gross,footprint,exterior,
  expectedGuests:keys*settings.occupancy/100*source.guestsPerKey/100};
}

function staffing(p,settings=preferences) {
 const workload=workloadTargets(p,settings);
 return staffGroups.flatMap(([department,reports,basePositions])=>{
   const positions=p.isApartment?basePositions.filter(([title])=>!['معالج سبا','منقذ مسبح'].includes(title)):p.isResort&&department==='السبا والترفيه'?basePositions.concat(resortPositions):basePositions;
   return positions.map(([title,baseCount,reference],i)=>{
   const count=sizedHeadcount(title,baseCount,p,workload);
   const tier=i===0?'قيادة القسم':/مدير|مشرف|رئيس|شيف/.test(title)?'إشراف':'تشغيل وتخصص';
   const supervisor=positions.slice(1,i).reverse().find(([name])=>/مدير|مشرف|رئيس|شيف/.test(name));
   const base=nearest((budgetInputs.salaryPrices[title]??wageAnchors[title]??reference)*settings.costIndex/100,1);
   const housing=Math.round(base*0.15), transport=Math.round(base*0.08), incentive=Math.round(base*0.05);
   const benefits=420+Math.round(base*0.12);
   const person=base+housing+transport+incentive+benefits;
      return {department,reports:i===0?reports:tier==='إشراف'?positions[0][0]:supervisor?.[0]||positions[0][0],level:tier,title,count,base,reference:wageAnchors[title]??reference,housing,transport,incentive,benefits,person,monthly:person*count};
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
 const zones=[['الإقامة',p.guestArea],...['خدمات الضيوف','خلفية وتشغيل','حركة رأسية وأفقية','إنشائي'].map(name=>[name,total(p.common.filter(x=>x.use===name),x=>x.area)])];
 for(const [scope,qty] of zones) for(const [name,hotel,resort] of constructionTrades) push(name,scope,'م²',qty,Math.round((p.isResort?resort:hotel)*(p.isResort?2.4:2.55)));
 push('بلاطات وعزل وتكسية','تراسات الغرف','م²',p.terraceArea,p.isResort?850:680);
 push('مصاعد نزلاء وخدمة','الربط الرأسي','مصعد',p.isApartment?2:p.isResort?6:5,385000);
 push('تبليط ومراوح وشبكات','المواقف','م²',p.parking,235);
 push('أسفلت وأرصفة وتصريف','طرق وممرات الموقع','م²',p.roads,335);
 push('تربة وزراعة وري وإنارة','اللاند سكيب','م²',p.landscape,270);
 push('أحواض وعزل وترشيح','حمامات السباحة','م²',p.pool,2300);
 push('تسوية وأرضيات وإضاءة','الملاعب','م²',p.sports,510);
 push('بوابات وأسوار وتمديدات','مرافق الموقع','م²',p.utilities,860);
 push('شبكة معالجة وربط خدمات','بنية تحتية','حزمة',p.isResort?3:1,390000);
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
   const externalDemand=serviceExternal(category,external,p);
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
 const refs=planningReference.referenceRooms.map(([level,...ratios],i)=>[(5-i)+' نجوم',...ratios.map(value=>pn(Number(value.replace(',','.'))))]);
 const benchmark='<p>تعتمد المقارنة على مساحة الغرفة وحمامها، وعلى إجمالي المسطح المبني لكل مفتاح. حصة الفرد المرجعية ناتجة من قسمة مؤشر المفتاح على سعة النموذج. مؤشرات الأرض واللاند سكيب والمواقف والممرات محسوبة من تصميم السيناريو وتصلح للمقارنة بين الفندق والمنتجع.</p>'+
  '<p><a href="'+hsuLink+'" target="_blank" rel="noopener">Hotelstars Union · 2025–2030</a> · <a href="'+hvsLink+'" target="_blank" rel="noopener">HVS · مؤشرات التطوير الخليجي</a> · <a href="'+adaLink+'" target="_blank" rel="noopener">ADA · القسم 224</a></p>'+
  table(['المؤشر','النموذج','المرجع','القراءة'],[
   ['المبني لكل مفتاح',asArea(p.gross/p.keys),asArea(p.benchmark),(p.gross/p.keys>=p.benchmark?'أعلى':'أقل')+' من القيمة المرجعية'],
   ['المبني لكل ضيف عند الطاقة الكاملة',asArea(p.gross/p.beds),asArea(p.benchmark/(p.beds/p.keys)),'القيمتان على أساس عدد الأسرّة في النموذج'],
   ['الغرفة الأساسية مع الحمام',asArea(p.units[0].net+p.units[0].bath),p.roomBenchmark+' م²','النطاق النموذجي لدى HVS لفئة '+(p.isResort?'المنتجع الفاخر':'الفندق الراقي')],
   ['مساحة الغرفة مع الحمام',p.units.map(x=>asArea(x.net+x.bath)).join(' / '),'14 / 18 / 22 / 30 م²','درجات مساحة في كتالوج Hotelstars Union'],
   ['الوحدات المهيأة للحركة',pn(p.accessible),p.keys<=100?'5':p.keys<=150?'7':'8','مقارنة تخطيطية بجدول ADA الأمريكي']
  ]);
 return '<div class="cards">'+[card('مساحة الأرض',asArea(p.land)),card('إجمالي المسطح المبني',asArea(p.gross)),card('طاقة الإيواء التصميمية',pn(p.beds)+' ضيف'),card('تغطية المباني للأرض',percent(p.footprint/p.land*100))].join('')+'</div>'+
  displaySection('استخدام الأرض والمرافق الخارجية',['الاستخدام','المساحة','نسبة الأرض','م² لكل ضيف تصميمي','م² لكل ضيف متوقع'],p.exterior.map(([name,area])=>[name,asArea(area),percent(area/p.land*100),pn(area/p.beds),pn(area/p.expectedGuests)]))+
  displaySection('مساحة وحدات الضيافة ومرافقها',['النوع','عدد الوحدات','الصافي / وحدة','الحمام','التراس','الداخلي / وحدة','المشتركات / وحدة','الشامل / وحدة','سعة الوحدة','شامل م² / ضيف','إجمالي الداخلي','سعر الليلة'],p.units.map(x=>[x.name,pn(x.count),asArea(x.net),asArea(x.bath),asArea(x.terrace),asArea(x.net+x.bath),asArea(p.commonArea/p.keys),asArea(sumArea(p,x)),pn(x.beds),pn(sumArea(p,x)/x.beds),asArea(x.count*(x.net+x.bath)),pm(x.price)]))+
  displaySection('الفراغات المبنية المشتركة والممرات والخدمات',['الفراغ','التصنيف','عدد الفراغات','المسطح الإجمالي','حصة المبني','م² / مفتاح','م² / ضيف تصميمي','م² / ضيف متوقع'],p.common.map(x=>[esc(x.name),x.use,pn(x.count),asArea(x.area),percent(x.area/p.gross*100),pn(x.area/p.keys),pn(x.area/p.beds),pn(x.area/p.expectedGuests)]))+
  (p.isApartment?'':panel('مقارنة تخطيطية دولية',benchmark))+
  displaySection('مؤشرات محلية واردة في الدراسة الفنية',['الفئة','غرفة وحمام','صالة الطعام','صالون وخدمة','المطابخ','ممرات وسلالم','خدمات وإنشائية','إجمالي م² / غرفة'],refs)+
  localReferenceView(p)+panel('أساس القياس','<p>المسطح المبني المغلق يجمع الوحدة الداخلية والمشتركات. التراس ظاهر في المساحة الشاملة للغرفة وبند إنشائي مستقل. البصمة التقديرية = المسطح المغلق مقسومًا على '+pn(p.floors)+' طوابق مكافئة. عمود الضيف المتوقع يستخدم إشغال '+percent(preferences.occupancy)+' ومتوسط '+pn(p.guestsPerKey)+' ضيفًا لكل 100 وحدة مشغولة. حصة المرافق للمقارنة موزعة بالتساوي على المفاتيح.</p>');
}

function localReferenceView(p) {
 if(p.isApartment) return classificationPanel()+panel('برنامج الشقة الفندقية','<p>تشمل الشقة مساحة معيشة ومطبخًا أو مطبخًا صغيرًا وغرفة نوم أو أكثر وحمامًا. يتضمن نموذج إيوان أيضًا غرف ضيافة منفصلة ضمن النسبة المتبقية.</p>');
 if(p.isResort) {
   return displaySection('خط أساس توزيع الأرض في الدراسة الفنية',['الاستخدام في المرجع','نسبة أرض المرجع','م² في المشروع المرجعي'],
     planningReference.resortLand.map(([name,ratio,area])=>[esc(name),esc(ratio),esc(area)]))+
     panel('مقياس مشروع المرجع','<p>الدراسة الفنية تعرض موقعًا أصليًا من 272,600 م² داخل حدوده، وتفصل مساحة الطريق الخارجي البالغة 40,000 م². سيناريو إيوان يستخدم منتجع ضيافة أصغر؛ وحدات البيع السكنية في المرجع مستقلة عن ليالي الإقامة.</p>');
 }
 return displaySection('خط أساس وحدات الضيافة في Book1',['النوع المرجعي','الوحدات','صافي م² / وحدة','شامل م² / وحدة','إجمالي م²'],
   planningReference.hotelRooms.map(([name,gross,shared,net,mix,beds,count,area])=>[esc(name),pn(count),pn(net),pn(gross),pn(area)]))+
   panel('مقياس مشروع المرجع','<p>Book1 يعرض أرضًا من 3,150 م² ومسطحًا مبنيًا من 4,788 م² ومخزونًا من 70 وحدة. يعرض إيوان برنامجًا مكانيًا مستقلًا لـ200 غرفة وجناح وأربعة مطاعم. تستخدم المقارنة مخزون المرجع ومساحته للسياق فقط.</p>');
}
function staffingView(p) {
 const rows=staffing(p);
 const wages=total(rows,x=>x.monthly);
 const work=workloadTargets(p);
 return '<div class="cards">'+[card('الأقسام',pn(staffGroups.length)),card('المسميات الوظيفية',pn(rows.length)),card('قوة العمل',pn(total(rows,x=>x.count))),card('التعويض الشهري الكامل',pm(wages)),card('التعويض السنوي',pm(wages*12))].join('')+'</div>'+
 panel('أساس تغطية التشغيل',row('الغرف المشغولة المخططة',pn(work.occupied))+row('الوجبات والتغطيات المتوقعة يوميًا',pn(work.covers))+row('المطاعم والمقهى',pn(p.restaurants)+' مطاعم ومقهى')+row('طهاة الخطوط قبل الشيفات والمساعدين',pn(work.cooks))+row('غرف المغادرة المتوقعة يوميًا',pn(work.departures)))+
 displaySection('ملخص الملاك الوظيفي حسب الإدارة',['الإدارة','الموظفون','الأساسي شهريًا','البدلات والحوافز والمنافع','إجمالي شهري','إجمالي سنوي'],staffGroups.map(([name])=>{
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
 panel('تقدير الأسعار والكميات','<p>الحصر مبني على برنامج الفندق والطاقة والوظيفة. الرصد المعلن من قوائم الموردين بالسعودية وعولج في النموذج لموازنة صافية قبل الضريبة. المقارن السوقي يؤسس تقديرًا لصنف مشابه، والبنود المخصصة تحتاج عرض توريد وتركيب. يشتق تعديل السعر الأساسي أثره على قيمة التجهيزات والإهلاك ومخصص الصيانة. أنظمة المبنى الثابتة ضمن الإنشاءات.</p>');
}
function equipmentTable(rows) {
 return table(['الموقع','الصنف','الكمية','السعر المعلن شامل الضريبة','سعر الوحدة للميزانية','الإجمالي','درجة التحقق','المصدر','الإجراء'],rows.map(x=>[
  esc(x.zone),esc(x.name),pn(x.quantity),x.listPrice?pm(x.listPrice):'حسب التوريد',pm(x.price),pm(x.price*x.quantity),badge(x.status,x.status==='يتطلب عرض توريد'),
  '<a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.source)+'</a>',
  budgetButton('equipmentPrices',x.sku,budgetInputs.equipmentPrices[x.sku]??Math.round(x.price*10000/(preferences.costIndex*preferences.equipmentIndex)))
 ]));
}
function constructionView(p) {
 const rows=construction(p);
 const direct=total(rows,x=>x.qty*x.rate);
 const {design:soft,contingency:reserve}=investment(p);
 const constructionCost=direct+soft+reserve;
 return '<div class="cards">'+[card('الأعمال المباشرة',pm(direct)),card('هندسة وإشراف',pm(soft)),card('احتياطي',pm(reserve)),card('إجمالي موازنة الإنشاء',pm(constructionCost))].join('')+'</div>'+
 displaySection('ملخص التكلفة الإنشائية حسب الموقع',['الموقع','عدد الأعمال','تكلفة الأعمال المباشرة'],Array.from(new Set(rows.map(x=>x.scope))).map(scope=>{
  const inScope=rows.filter(x=>x.scope===scope);
  return [scope,pn(inScope.length),pm(total(inScope,x=>x.qty*x.rate))];
 }))+displaySection('بنود الكميات والأسعار للمباني والموقع',['الموقع','البند','الوحدة','الكمية','سعر الوحدة','الإجمالي','الموازنة'],rows.map(x=>[x.scope,x.packageName,x.unit,pn(x.qty),pm(x.rate),pm(x.qty*x.rate),budgetButton('constructionPrices',x.ref,x.reference)]))+
 panel('حدود الموازنة',row('إجمالي الإنشاء لكل مفتاح',pm(constructionCost/p.keys))+row('إجمالي الإنشاء والتجهيزات',pm(constructionCost+total(equipment(p),x=>x.quantity*x.price)))+
 '<p>أسعار الحزم تقديرات أولية بمرجع سوقي خليجي ومقارنة البناء في الرياض. فروق المواصفات والموقع والمناقصات تحتاج تسعير مقاول. يضاف الإشراف والاحتياطي من إعدادات لوحة التحكم. تظهر الأرض والافتتاح ورأس المال العامل في إجماليات الاستثمار.</p><p>'+sourceLink('hvs')+' · '+sourceLink('build')+'</p>');
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
 link.download='iwan-plan-'+preferences.scenario+'-'+preferences.year+'.json';
 link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});
