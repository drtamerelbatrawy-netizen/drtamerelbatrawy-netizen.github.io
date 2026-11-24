'use strict';

function venuesFor(){
 return [
  {name:'المطعم الرئيسي',seats:32,hours:12,kitchen:'مطبخ المطعم',area:130},
  {name:'مقهى اللوبي',seats:18,hours:12,kitchen:'بار تحضير',area:55}
 ];
}

function serviceEnabled(service,p){
 return (!p.isApartment||!['السبا','العناية','المسبح','الشاطئ','الرحلات'].includes(service[0]))&&(!service[7]||p.isResort);
}
const hospitalitySources={
 oven:['Rational iCombi Pro 10-1/1 · إكويب','https://www.ekuep.com/ar/Rational'],
 bakery:['الوطنية OV3F100 وعرض الحلويات · إكويب','https://www.ekuep.com/ar/alwatania-factory'],
 pizza:['BMAX ورفوف ستانلس · إكويب','https://www.ekuep.com/ar/bmax'],
 cooling:['True T-49 وPitco SE14T-D · إكويب','https://www.ekuep.com/ar/search'],
 line:['معدات الطهي التجارية · إكويب','https://www.ekuep.com/ar/cooking-equipment/'],
 dish:['Hobart وHonved · إكويب','https://www.ekuep.com/ar/dishwashing/undercounter-dishwashers/'],
 hoodDish:['Hobart AM15VL-2 · إكويب','https://www.ekuep.com/ar/clearance/dishwashers/'],
 ice:['Aristarco 50 kg · إكويب','https://www.ekuep.com/ar/ice-equipment/self-contained-ice-makers/'],
 steel:['طاولات ستانلس · إكويب','https://www.ekuep.com/ar/stainless-steel-equipment/stainless-steel-tables/'],
 coffeeList:['Sanremo Zoe مجموعتان · إكويب','https://www.ekuep.com/ar/coffee-makers/espresso-machines/'],
 bed:['مراتب 160×200 · IKEA السعودية','https://www.ikea.com/sa/en/cat/mattresses-bm002/f/mattresses-size-160x200-cm-f-typed-reference-measurement--160x200-mattresses/'],
 tv:['شاشات 55 بوصة · إكسترا السعودية','https://www.extra.com/ar-sa/electronics/television/led/c/1-109-1'],
 hvs:['HVS · ميزانيات تطوير فنادق الخليج','https://hvs.com/StaticContent/9755/HVSWC-Navigating%20The%20Hospitality%20Investment%20Terrain-%20GCC%20development%20costs.pdf'],
 build:['Turner & Townsend · تكاليف البناء 2026','https://publications.turnerandtownsend.com/global-construction-market-intelligence-2026-us/middle-east'],
 electricity:['الشركة السعودية للكهرباء · التعريفة','https://www.se.com.sa/ar-sa/ourservices/columnc/bills-and-consumption/consumptiontariffs/'],
 tourism:['الهيئة العامة للإحصاء · إحصاءات المنشآت السياحية','https://www.stats.gov.sa/en/statistics-tabs/-/categories/124304?category=124304&delta=60&tab=436312']
};
// Prices marked 'listed' are observed Saudi retail listings including tax. Other rows use net budget estimates.
const procurement = [
 ['FO-01','المطبخ المركزي','فرن Rational iCombi Pro 10-1/1',76356,'central',2,'oven','listed'],
 ['FO-02','المخبز','فرن الوطنية OV3F100 ثلاثي الطوابق',17221,'central',1,'bakery','listed'],
 ['FO-03','خطوط الإنهاء','فرن BMAX EO309 ثلاث حجرات',10350,'central',1,'pizza','listed'],
 ['FO-04','خطوط الإنهاء','قلاية Pitco مزدوجة SE14T-D',34839,'restaurants',0.5,'cooling','listed'],
 ['FO-05','التبريد','ثلاجة True T-49 عمودية بابان',24997,'restaurants',1.5,'cooling','listed'],
 ['FO-06','غسيل الأواني','غسالة هوبارت AM15VL-2 بغطاء علوي',68789,'central',1,'hoodDish','listed'],
 ['FO-07','غسيل الأواني','غسالة Honved CE60 تحت السطح',9703,'restaurants',0.75,'dish','listed'],
 ['FO-08','تحضير المشروبات','صانعة ثلج أريستاركو 50 كجم',7418,'outlets',1,'ice','listed'],
 ['FO-09','المخبز','ثلاجة عرض الوطنية CIGS011',9356,'central',2,'bakery','listed'],
 ['FO-10','تحضير المشروبات','إسبريسو Sanremo Zoe بمجموعتين',13628,'central',2,'coffeeList','listed'],
 ['FO-11','التحضير','طاولة عمل ستانلس مع عازل خلفي',984,'outlets',4,'steel','listed'],
 ['FO-12','التحضير','رف جداري BMAX WES2260',920,'outlets',2,'pizza','listed'],
 ['FO-13','خطوط الإنهاء','موقد تجاري 6 شعلات وفرن',12600,'restaurants',1,'line'],
 ['FO-14','خطوط الإنهاء','شواية فحم تجارية وخط شواء',16500,'restaurants',0.5,'line'],
 ['FO-15','خطوط الإنهاء','صاج سطح مستوٍ وسلامندر',14500,'restaurants',0.75,'line'],
 ['FO-16','التحضير','مفرمة وخلاط يدوي ومحضر أغذية',8750,'central',2,'line'],
 ['FO-17','التبريد','فريزر تجاري بابان',22200,'central',3,'cooling'],
 ['FO-18','التبريد','غرفة تبريد توريد وتجهيز داخلي',105000,'central',2],
 ['FO-19','التبريد','غرفة تجميد مع وحدة ضاغط',135000,'central',1],
 ['FO-20','التبريد','مبرد سريع لصواني التحضير',46900,'central',1,'cooling'],
 ['FO-21','المخبز','عجانة وعصارة ومخمر',34000,'central',1,'line'],
 ['FO-22','غسيل الأواني','أحواض ثلاثية ومحطات شطف',7200,'restaurants',1,'steel'],
 ['FO-23','غسيل الأواني','معالجة مياه الغسالات وتخزين سلال',9600,'central',2,'dish'],
 ['FO-24','التحضير','عربة صواني GN وعربات نقل',2100,'outlets',3],
 ['FO-25','التوزيع','خزانة حفظ ساخن وعربة نقل معزولة',15600,'outlets',2],
 ['FO-26','التحضير','أواني طهي وسكاكين وألواح وميزان',10800,'restaurants',1],
 ['FO-27','الاستلام','ميزان أرضي ومنضدة استلام وعربة تحميل',9200,'central',2],
 ['FO-28','المخازن','رفوف غذائية ومناطق فصل',4200,'outlets',3],
 ['FO-29','تحضير المشروبات','مطحنة وموزع وحزمة تصفية',8900,'central',2,'coffeeList'],
 ['FO-30','تحضير المشروبات','خلاط وعصارة تجارية',5500,'outlets',1],
 ['FO-31','المطاعم','كرسي ضيافة تجاري',680,'seats',1],
 ['FO-32','المطاعم','طاولة مطعم لأربعة أشخاص',1750,'seats',0.25],
 ['FO-33','المطاعم','أواني تقديم وزجاجيات وأدوات مائدة',230,'seats',2],
 ['FO-34','المطاعم','بوفيه عرض وتقديم متنقل',26000,'restaurants',1],
 ['FO-35','خدمة الغرف','عربات وصناديق حفظ حرارة',3200,'keys',0.05],
 ['RM-01','الغرف','قاعدة سرير ولوح رأس فندقي',3100,'keys',1,'bed'],
 ['RM-02','الغرف','مرتبة فندقية وحامٍ للمرتبة',1900,'keys',1,'bed'],
 ['RM-03','الغرف','شاشة 55 بوصة · Samsung فئة استرشادية',1749,'keys',1,'tv','listed'],
 ['RM-04','الغرف','خزانة ورف حقائب ووحدة بار',5800,'keys',1],
 ['RM-05','الغرف','مكتب وطاولة جانبية وكرسي',2200,'keys',1],
 ['RM-06','الغرف','كرسي استرخاء وطاولة',2200,'keys',1],
 ['RM-07','الغرف','ستائر تعتيم وشفافة',2400,'keys',1],
 ['RM-08','الغرف','مفارش ومناشف بطقم تداول',490,'keys',3],
 ['RM-09','الغرف','قفل إلكتروني وبطاقة احتياطية',1550,'keys',1.05],
 ['RM-10','الغرف','خزنة رقمية',670,'keys',1],
 ['RM-11','الغرف','ميني بار وغلاية وصينية ضيافة',1650,'keys',1],
 ['RM-12','الغرف','مجفف شعر وموزعات وحاويات',560,'keys',1],
 ['RM-13','الديكور','مصابيح مستقلة ومرايا ولوحات',1650,'keys',1],
 ['RM-14','الأجنحة','حزمة الجلوس والمعيشة',10500,'suites',1],
 ['RM-15','التدبير','عربة تدبير ومكنسة تجارية',4600,'keys',0.10],
 ['LD-01','المغسلة','غسالة صناعية 35 كجم',74000,'central',3],
 ['LD-02','المغسلة','مجفف صناعي 35 كجم',47000,'central',3],
 ['LD-03','المغسلة','مكواة أسطوانية ومكبس',138000,'central',1],
 ['LD-04','المغسلة','عربة فرز وعربة بياضات وطاولة طي',12500,'central',3],
 ['PB-01','الاستقبال','كاونتر ضيافة ومكاتب خلفية',165000,'central',1],
 ['PB-02','اللوبي','مجموعة جلوس ولوحات وسجاد ومصابيح',324000,'central',1],
 ['PB-03','القاعات','كرسي اجتماعات',470,'halls',80],
 ['PB-04','القاعات','طاولة اجتماعات قابلة للطي',980,'halls',20],
 ['PB-05','القاعات','صوتيات وشاشات وعرض وتحكم',84500,'halls',1],
 ['PB-06','القاعات','منصة متنقلة وبياضات ومرابط',29000,'halls',1],
 ['PB-07','السبا','طاولة علاج احترافية',9200,'central',5],
 ['PB-08','السبا','خزائن ومفروشات وأدوات علاج',35000,'central',1],
 ['PB-09','النادي','جهاز مشي تجاري',19500,'central',5],
 ['PB-10','النادي','دراجات ومقاومة وأثقال',108000,'central',1],
 ['PB-11','المسبح','كرسي استرخاء ومظلة',2100,'poolSeats',1],
 ['PB-12','المسبح','تجهيز إنقاذ وفحص مياه متنقل',18500,'central',1],
 ['PB-13','الرياضة والأطفال','حزمة معدات وأنشطة وأثاث',52000,'central',1],
 ['PB-14','المناطق الخارجية','جلسات خارجية ووحدات متنقلة',5500,'outlets',4],
 ['PB-15','التجزئة','وحدات عرض ورفوف المتاجر',4200,'central',8],
 ['IT-01','التشغيل الرقمي','نقطة بيع وملحقات',4800,'outlets',2],
 ['IT-02','التشغيل الرقمي','طابعة مطبخ ومحطة طلب',3100,'outlets',2],
 ['IT-03','التشغيل الرقمي','خوادم وتخزين ونسخ احتياطي',78500,'central',1],
 ['IT-04','التشغيل الرقمي','حاسب محطة عمل وملحقات',3500,'keys',0.19],
 ['IT-05','الاستقبال','محطة إصدار مفاتيح وبطاقات',3400,'central',4],
 ['IT-06','الإدارات','محطة عمل وأرفف وخزائن',4400,'keys',0.19],
 ['IT-07','الأمن','أجهزة اتصال ومعدات إسعاف وإنعاش',46500,'central',1],
 ['IT-08','الهندسة','عدة مهنية وأجهزة قياس ومخزون قطع',159000,'central',1],
 ['IT-09','النقل','مركبة فان للضيوف',165000,'central',2],
 ['IT-10','النقل','عربة تشغيل كهربائية داخلية',39500,'central',2],
 ['IT-11','العاملون','خزانة تغيير فردية وزي أولي',1100,'employees',1],
 ['IT-12','النظافة والمخازن','مكنسة ساحة وآلة غسيل أرضيات',38500,'central',2],
 ['IT-13','الحدائق','جزازة ومعدات ري مستخدمة في الصيانة',24500,'central',1]
];
const budgetDefaults={hallBookingsMonthly:0,rooftopOrdersDaily:0,externalDemand:100,baseKwh:90,nightKwh:27,waterNight:260,waterBase:4,waterRate:9,maintenanceBasis:200,insuranceBasis:45,adminMonthly:6500,marketingBasis:180,interestYear:0,taxYear:0,equipmentPrices:{},servicePrices:{},salaryPrices:{},constructionPrices:{}};
const modelStorage='anam-model-1';
const budgetInputs={...budgetDefaults,...JSON.parse(localStorage.getItem(modelStorage)||'{}')};
const foodTypes=new Set(['المطعم الرئيسي','مطعم التخصصات','مطعم المشويات','مقهى اللوبي','مطعم المسبح','المشروبات','الميني بار','المطبخ','خدمة الغرف','المطاعم']);
const foodCovers=new Set(['بوفيه إفطار','غداء','عشاء','وجبة حسب القائمة','وجبة مشويات كاملة','وجبة خفيفة','قهوة وحلويات','تقديم طعام للاجتماع','وجبة خدمة الغرف','تجربة عشاء شاطئي']);
function departmentFor(category){
 if(category==='كافيه السطح'||foodTypes.has(category)) return 'الأغذية والمشروبات';
 if(['القاعات','خدمات الأعمال'].includes(category)) return 'الفعاليات والأعمال';
 if(['السبا','العناية','النادي','المسبح','الأنشطة','الشاطئ','الرحلات','المنتجع'].includes(category)) return 'السبا والترفيه';
 return category;
}
function serviceExternal(category,raw,p) {return Math.round(raw*budgetInputs.externalDemand/100*(p.isResort?1.5:1));}
function workloadTargets(p,settings=preferences) {
 const occupied=Math.round(p.keys*settings.occupancy/100), departures=Math.ceil(occupied/p.averageStay);
 const guests=p.expectedGuests;
 const covers=total(serviceCatalog.filter(x=>foodCovers.has(x[1])&&serviceEnabled(x,p)),([category,,unit,,attach,,external])=>guests*attach/100+serviceExternal(category,external,p));
 const fte=posts=>Math.ceil(posts*7/5);
 const cleaningHours=(departures*35+(occupied-departures)*22)/60;
 return {occupied,departures,covers,
  cooks:fte(Math.max(p.outlets+4,Math.ceil(covers/46)+3)),
  kitchenAssist:fte(Math.max(5,Math.ceil(covers/115))),
  stewards:fte(Math.max(p.outlets+1,Math.ceil(covers/93))),
  waiters:fte(Math.max(p.outlets*3,Math.ceil(covers/26))),
  attendants:fte(Math.ceil(cleaningHours/6)),
  reception:fte(5+Math.ceil(departures/36)),
  roomService:fte(Math.max(4,Math.ceil(occupied/26))),
  technicians:fte(Math.max(7,Math.ceil(p.gross/2600))),
  fte};
}
function sizedHeadcount(title,base,p,w){
 const rated={
  'موظف استقبال':w.reception,'عامل غرف':w.attendants,'موظف خدمة غرف':w.roomService,
  'مقدم طعام':w.waiters,'طاهٍ':w.cooks,'مساعد تحضير':w.kitchenAssist,
  'عامل غسيل أوانٍ':w.stewards,'مدير منفذ':p.restaurants,'رئيس قسم مطبخ':p.restaurants+1,
  'شيف مساعد':Math.ceil(p.restaurants/2),'خباز وحلواني':w.fte(3),
  'فني كهرباء':Math.ceil(w.technicians/3),'فني تكييف':Math.ceil(w.technicians/3),'فني سباكة':Math.max(2,Math.floor(w.technicians/4)),
  'فني أعمال عامة':Math.max(3,Math.ceil(p.keys/55)),'حارس ومراقب كاميرات':w.fte(Math.max(9,Math.ceil(p.keys/16))),
  'عامل مغسلة وكي':w.fte(Math.max(4,Math.ceil(w.occupied/19))),
  'مشرف طوابق':Math.ceil(w.attendants/6)
 };
 return rated[title]??(base===1?1:Math.ceil(base*Math.max(1,p.keys/145)));
}
function revisedEquipment(p,settings=preferences){
 const packages=[
  ['BED','أطقم غرف النوم',43,5850],['KIT','مطابخ وتجهيزات',35,6650],
  ['CUR-L','ستائر كبيرة',43,1550],['CUR-S','ستائر صغيرة',17,1150],
  ['TV','وحدات تلفاز وصالة',35,1000],['SOFA-S','كنب مفرد',10,1800],
  ['SOFA-D','كنب ثنائي',25,2500],['TABLE','طاولات وسط وجانبية',35,1250],
  ['CHAIR','كراسي مفردة',35,750]
 ];
 return packages.map(([sku,name,quantity,reference])=>{
  const edited=budgetInputs.equipmentPrices[sku];
  const price=Math.round((edited??reference)*settings.costIndex*(settings.equipmentIndex??100)/10000);
  return {sku,zone:'تأثيث الوحدات',category:'تأثيث الوحدات',name,quantity,price,
   status:edited?'سعر مدخل':'تقدير التوريد',listPrice:0,source:'موازنة التأثيث'};
 });
}

const costLabels={rent:'إيجار المبنى',wages:'الرواتب والأجور والتعويضات',roomCost:'مستهلكات الغرف والتنظيف المتغير',servicesCost:'أغذية ومشروبات وتكلفة تقديم الخدمات',distribution:'عمولات توزيع الغرف',electricity:'الكهرباء',water:'المياه والصرف',repairs:'الصيانة الوقائية والعقود وقطع الغيار',insurance:'التأمين والتراخيص',admin:'الإدارة والأنظمة والاتصالات والنفايات',marketing:'المبيعات والتسويق',interest:'فوائد وتمويل',depreciation:'إهلاك الأصول',tax:'مخصص ضريبة أو زكاة مدخل'};
const editableBudget=[
 ['hallBookingsMonthly','قاعة الاجتماعات · حجوزات شهرية مخططة',0,60],
 ['rooftopOrdersDaily','كافيه السطح · طلبات يومية مخططة',0,300],
 ['externalDemand','مؤشر الطلب الخارجي %',0,400],['baseKwh','كهرباء أساسية ك.و.س / م² / سنة',1,500],
 ['nightKwh','كهرباء إضافية ك.و.س / ليلة',0,150],['waterNight','مياه لتر / ليلة',0,3000],['waterBase','مياه مرافق م³ / يوم',0,1000],
 ['waterRate','مياه وصرف ر.س / م³',0,100],['maintenanceBasis','صيانة المعدات · نقطة أساس من التكلفة سنويًا',0,2500],
 ['insuranceBasis','التأمين · نقطة أساس من الإنشاء سنويًا',0,1000],['adminMonthly','إدارة وأنظمة واتصالات شهريًا',0,10000000],
 ['marketingBasis','تسويق · نقطة أساس من الإيراد',0,5000],['interestYear','تمويل سنوي',0,100000000],['taxYear','مخصص ضريبة أو زكاة سنوي مدخل',0,100000000]
];
function electricityPrice(year) {return year>=2027?35:32;}
function capitalBase(p,settings) {
 const signature=JSON.stringify([p.keys,p.gross,p.expectedGuests,settings.costIndex,settings.equipmentIndex,settings.buildIndex,budgetInputs.externalDemand,budgetInputs.equipmentPrices,budgetInputs.salaryPrices,budgetInputs.constructionPrices]);
 if(capitalCache.has(signature)) return capitalCache.get(signature);
 const eq=total(revisedEquipment(p,settings),x=>x.price*x.quantity);
 const build=total(construction(p,settings),x=>x.qty*x.rate);
 if(capitalCache.size>=12) capitalCache.delete(capitalCache.keys().next().value);
 const value={eq,build};
 capitalCache.set(signature,value);
 return value;
}
const capitalCache=new Map();

function detailedOperatingCosts(p,offset,days,settings,{sold,revenue,roomCost,servicesCost,distribution,wages}){
 const yearDays=daysInYear(settings.year);
 const capital=capitalBase(p,settings);
 const accrued=annual=>between(annual/yearDays,offset,days);
 const priorSold=commercialRoomForecast(p,0,offset,settings).sold;
 const electricityThrough=(day,rooms)=>{
  const consumed=p.gross*budgetInputs.baseKwh*day/yearDays+rooms*budgetInputs.nightKwh;
  const tier=Math.min(consumed,72000*day/yearDays);
  const high=electricityPrice(settings.year), low=settings.year>=2027?25:22;
  return Math.round((tier*low+(consumed-tier)*high)/100);
 };
 const electricity=electricityThrough(offset+days,priorSold+sold)-electricityThrough(offset,priorSold)+accrued(settings.year>=2027?12*900:0);
 const waterVariable=rooms=>Math.round(rooms*budgetInputs.waterNight*budgetInputs.waterRate/1000);
 const water=accrued(budgetInputs.waterBase*budgetInputs.waterRate*yearDays)+waterVariable(priorSold+sold)-waterVariable(priorSold);
 const repairs=accrued(capital.eq*budgetInputs.maintenanceBasis/10000+capital.build*0.006);
 const insurance=accrued(capital.build*budgetInputs.insuranceBasis/10000+12000);
 const admin=accrued(budgetInputs.adminMonthly*12);
 const rent=accrued(p.annualRent);
 // Multiplication before rounding keeps projected totals equal when slicing the period.
 const marketing=revenue*budgetInputs.marketingBasis/10000;
 const costs={wages,roomCost,servicesCost,distribution,electricity,water,repairs,insurance,admin,marketing,rent};
 const operating=total(Object.values(costs));
 const depreciation=accrued(capital.build/35+capital.eq/7);
 const interest=accrued(budgetInputs.interestYear);
 const tax=accrued(budgetInputs.taxYear);
 const gop=revenue-operating;
 return {costs,operating,gop,overhead:electricity+water+repairs+insurance+admin+marketing+rent,depreciation,interest,tax,net:gop-depreciation-interest-tax,
  roomNetCost:roomCost,capital};
}
function departmentalBudget(p,f,settings=preferences){
 const rows=new Map();
 const get=(name)=>{
  if(!rows.has(name)) rows.set(name,{name,revenue:0,materials:0,payroll:0,fees:0});
  return rows.get(name);
 };
 const rooms=get('الغرف والإقامة');
 rooms.revenue=f.roomRevenue;rooms.materials=f.roomCost;rooms.fees=f.distribution;
 for(const service of f.services){ const row=get(departmentFor(service.category));row.revenue+=service.revenue;row.materials+=service.cost; }
 const assigned={'الاستقبال والحجز':'الغرف والإقامة','التدبير والمغسلة':'الغرف والإقامة','الأغذية والمشروبات':'الأغذية والمشروبات','المطابخ':'الأغذية والمشروبات','السبا والترفيه':'السبا والترفيه'};
 const groups=staffing(p,settings);
 const salaryBase=total(groups,x=>x.monthly);
 let allocated=0;
 for(const [department,destination] of Object.entries(assigned)){
  const amount=Math.round(f.wages*total(groups.filter(x=>x.department===department),x=>x.monthly)/salaryBase);
  get(destination).payroll+=amount;allocated+=amount;
 }
 const central=get('الإدارات المساندة');
 central.payroll=f.wages-allocated;
 return [...rows.values()].map(x=>({...x,expense:x.materials+x.payroll+x.fees,result:x.revenue-x.materials-x.payroll-x.fees}));
}
const modelPages={departmentPL:'ربحية الأقسام',operatingCosts:'التكاليف التشغيلية وصافي الربح'};
const budgetPeriods=(p,settings)=>{
 const off=monthOffsets(settings.year);const month=settings.month;
 return [['أول يوم من الشهر',forecast(p,off[month-1],1,settings)],['الشهر المختار',forecast(p,off[month-1],off[month]-off[month-1],settings)],['السنة المختارة',forecast(p,0,off[12],settings)]];
};
function renderBusiness(name){
 const p=profile(), periods=budgetPeriods(p,preferences), annual=periods[2][1];
 const top='<div class="heading"><div><h1>'+modelPages[name]+'</h1><p class="muted">'+esc(p.label)+' · موازنة '+pn(preferences.year)+' · إشغال '+percent(preferences.occupancy)+'</p></div></div>'+planningControls();
 if(name==='departmentPL'){
  const cols=['القسم','الإيراد','مواد وتكاليف مباشرة','أجور مباشرة','عمولة التوزيع','إجمالي تكاليف القسم','مجمل ربح القسم','هامش القسم'];
  const blocks=periods.map(([label,f])=>{
   const d=departmentalBudget(p,f);
   return displaySection(label,cols,d.map(x=>[x.name,...[x.revenue,x.materials,x.payroll,x.fees,x.expense,x.result].map(pm),x.revenue?percent(x.result*100/x.revenue):'مركز تكلفة']).concat([
    ['الإجمالي',...[f.revenue,f.roomCost+f.servicesCost,f.wages,f.distribution,total(d,x=>x.expense),total(d,x=>x.result)].map(pm),'قبل التكاليف المشتركة']]));
  }).join('');
  return top+controlCards([['الإيرادات السنوية',pm(annual.revenue)],['مجمل الأقسام السنوي قبل التكاليف المشتركة',pm(annual.revenue-annual.roomCost-annual.servicesCost-annual.wages-annual.distribution)],['صافي الربح السنوي في السيناريو',pm(annual.net)]])+blocks+
   outletProfitPanel(p,annual)+postedBusinessPanel()+
   panel('أساس التجميع','<p>تظهر أجور الأقسام الخدمية في مركز تكلفة الإدارات المساندة. تظهر الكهرباء والمياه والصيانة العامة والتأمين والإدارة والتسويق والإهلاك والتمويل والمخصصات في صفحة التكاليف التشغيلية.</p>'+action('go','عرض التكاليف التشغيلية','operatingCosts'));
 }
 const costKeys=Object.keys(costLabels);
 return top+controlCards([['الربح التشغيلي السنوي GOP',pm(annual.gop)],['صافي الربح السنوي في السيناريو',pm(annual.net)],['هامش صافي الربح',annual.revenue?percent(annual.net*100/annual.revenue):'بانتظار إيراد']])+
  displaySection('قائمة التكاليف والنتيجة الصافية',['البند',...periods.map(([name])=>name)],[
   ['إجمالي الإيرادات',...periods.map(([,f])=>pm(f.revenue))],
   ...costKeys.filter(key=>!['depreciation','interest','tax'].includes(key)).map(key=>[costLabels[key],...periods.map(([,f])=>pm(f.costs[key]))]),
   ['إجمالي مصروفات التشغيل',...periods.map(([,f])=>pm(f.operating))],
   ['الربح التشغيلي GOP',...periods.map(([,f])=>pm(f.gop))],
   ...['depreciation','interest','tax'].map(key=>[costLabels[key],...periods.map(([,f])=>pm(f[key]))]),
   ['صافي الربح بعد المدخلات',...periods.map(([,f])=>pm(f.net))]
  ])+panel('مدخلات التشغيل المشتركة','<form id="budget-form" class="plan-controls">'+editableBudget.map(([id,label,min,max])=>
   '<label>'+label+'<input name="'+id+'" type="number" min="'+min+'" max="'+max+'" step="1" value="'+esc(budgetInputs[id])+'" required></label>').join('')+
   '<button class="primary">حفظ المدخلات والتحديث</button></form>')+
   panel('الأساس المحاسبي ومصادر المقارنة','<p>الإهلاك التقديري على 35 سنة للإنشاء و7 سنوات للتجهيزات. تُدخل فوائد التمويل ومخصصات الضريبة أو الزكاة حسب هيكل الملكية والتمويل؛ القيمة صفر تعني غياب مدخل. الكهرباء تحسب تعرفة تجارية تقديرية للعداد عالي الاستهلاك، مع توزيع عتبة الشريحة على أيام السنة لأغراض التوقع، والاستهلاك والمياه والمصاريف الجانبية افتراضات قابلة للتعديل.</p>'+
    sourceLink('electricity')+' · '+sourceLink('tourism'))+postedBusinessPanel();
}
function sourceLink(key){
 const [label,url]=hospitalitySources[key];
 return '<a href="'+url+'" target="_blank" rel="noopener">'+esc(label)+'</a>';
}
function persistBudget(){localStorage.setItem(modelStorage,JSON.stringify(budgetInputs));render();notify('تم حفظ المدخل وإعادة احتساب الأرقام المرتبطة');}
document.addEventListener('submit',event=>{
 if(event.target.id!=='budget-form') return;
 event.preventDefault();
 const values=Object.fromEntries(new FormData(event.target));
 Object.assign(budgetInputs,Object.fromEntries(editableBudget.map(([key])=>[key,Number(values[key])])));persistBudget();
});
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-budget]');
 if(!button) return;
 const [kind,ref]=[button.dataset.budget,button.dataset.ref];
 const prior=Number(button.dataset.value);
 const value=prompt('أدخل السعر الأساسي بالريال قبل تطبيق معامل التكلفة أو البيع',String(prior));
 if(value===null)return;
 if(!positive(value)){notify('أدخل سعرًا صحيحًا أكبر من صفر.');return;}
 budgetInputs[kind][ref]=Number(value);
 persistBudget();
});
const budgetButton=(kind,ref,value)=>'<button class="action" data-budget="'+kind+'" data-ref="'+esc(ref)+'" data-value="'+esc(value)+'">تعديل السعر</button>';

const wageAnchors={'المدير العام':50500,'مدير العمليات':22550,'مدير أغذية ومشروبات':20000,'مدير المكتب الأمامي':14500,'مدير التدبير':11900,'مدير مالي':19000,'رئيس الهندسة':16500,'مدير موارد بشرية':14000,'موظف استقبال':5500,'مضيف حجوزات':5000,'شيف تنفيذي':22000,'شيف مساعد':13500,'رئيس قسم مطبخ':9300,'طاهٍ':6950,'خباز وحلواني':6400,'مساعد تحضير':3300,'عامل غسيل أوانٍ':3100};
const wageGuide='https://theprofessionals.sa/wp-content/uploads/2026/11/SG-2026-Ar-18.pdf';
const jobGuide='https://anoudjob.com/en/jobs/shyf-dy-barty';
const wageBenchmarks='https://theprofessionals.sa/wp-content/uploads/2026/02/Salary-Guide-2025-The-Professionals.pdf';
const assetsBase=[
 ['HVAC','الهندسة','محطات تبريد وأجهزة تحكم',3,30,'عقد تبريد مركزي'],
 ['AHU','الهندسة','وحدات معالجة الهواء',17,30,'فحص التهوية وجودة الهواء'],
 ['ELV','الهندسة','مصاعد ضيوف وخدمة',5,30,'عقد المصاعد'],
 ['ELEC','الهندسة','لوحات رئيسية ومولد وتحويل',5,30,'صيانة التغذية الاحتياطية'],
 ['PUMP','الهندسة','مجموعات مضخات المياه والصرف',8,30,'فحص تسرب وضغط'],
 ['FIRE','الأمن والهندسة','لوحات الإنذار والإطفاء',7,30,'خطة صيانة السلامة'],
 ['LOCK','الغرف','أقفال ومكونات دخول',200,90,'اختبار دورات البطاريات'],
 ['POOL','الترفيه','دارات ترشيح وموازنة مسبح',3,14,'فحص منظومة المسبح']
];
function maintenanceAssets(){
 const p=controlProfile(), relevant=new Set(['FO-01','FO-04','FO-05','FO-06','FO-07','FO-18','FO-19','FO-20','FO-02','FO-10','LD-01','LD-02','LD-03','IT-03','IT-09']);
 return assetsBase.filter(([ref])=>ref!=='POOL'||p.pool>0).map(([ref,zone,name,count,cycle,owner])=>({ref,zone,name,count:ref==='LOCK'?p.keys:Math.max(1,Math.round(count*p.keys/200)),cycle,owner})).concat(
  equipment(p).filter(x=>relevant.has(x.sku)).map(x=>({ref:x.sku,zone:x.zone,name:x.name,count:x.quantity,cycle:x.zone==='النقل'?30:60,owner:'فريق الصيانة ومورد الأصل',value:x.price*x.quantity})));
}
function maintenancePage(){
 const assets=maintenanceAssets(), r=state.assetChecks??{};
 const open=state.maintenance.filter(x=>x.status!=='مغلق');
 const plan=budgetFor(state.day,addDays(state.day,1));
 const due=(x,i)=>r[x.ref]?addDays(r[x.ref].day,x.cycle):addDays(state.assetStart||state.day,i%5-1);
 return '<div class="heading"><div><h1>الصيانة والأصول</h1><p class="muted">سجل الغرف وبلاغات التشغيل وخطة الفحص الوقائي في '+esc(controlProfile().label)+'.</p></div></div>'+
 controlCards([['مجموع وحدات الأصل المسجلة',pn(total(assets,x=>x.count))],['أوامر غرفة مفتوحة',pn(open.length)],['مجموعات مستحقة للفحص',pn(assets.filter((x,i)=>due(x,i)<=state.day).length)],['مخصص صيانة اليوم',pm(plan.costs.repairs)]])+
 panel('أوامر العمل وحجب الغرف',action('new','فتح أمر صيانة غرفة','','primary')+generic('maintenance'))+
 displaySection('سجل الأصول وخطة الصيانة الوقائية',['رمز الأصل','الموقع','الأصل','العدد','دورية الفحص بالأيام','المسؤول أو نطاق العمل','الفحص القادم','آخر مستند','الإجراء'],assets.map((x,i)=>[
  x.ref,esc(x.zone),esc(x.name),pn(x.count),pn(x.cycle),esc(x.owner),badge(due(x,i),due(x,i)<=state.day),
  esc(r[x.ref]?.note||'ضمن خطة الفحص الأولية'),'<button class="action" data-asset-check="'+x.ref+'">تسجيل فحص</button>'
 ]))+'<p class="muted">الدوريات افتراضات خطة تشغيل، وتحتاج اعتماد دليل المورد وعقد الصيانة لكل أصل.</p>';
}
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-asset-check]');
 if(!button)return;
 const ref=button.dataset.assetCheck;
 const asset=maintenanceAssets().find(x=>x.ref===ref);
 if(!asset)return;
 const note=prompt('مرجع محضر الفحص المنفذ لـ '+asset.name);
 if(!note?.trim())return;
 state.assetChecks??={};state.assetChecks[ref]={day:state.day,note:note.trim()};
 save('تم توثيق الفحص الوقائي · '+ref);
});
function hotelRooms(previous=[],mix=capacityMix()){
 const proposed=previous.map(r=>r.type==='فيلا'?{...r,type:'جناح تنفيذي'}:r);
 const known=new Set(proposed.map(r=>r.id));
 let ordinal=0;
 const next=()=>String((Math.floor(ordinal/30)+1)*100+ordinal++%30+1);
 for(const [type,expected] of mix){
  const count=proposed.filter(x=>x.type===type).length;
  for(let i=count;i<expected;i++){
   let id=next(); while(known.has(id)) id=next();
   known.add(id); proposed.push({id,type,clean:'جاهزة'});
  }
 }
 return proposed;
}

function postedDepartmentSummary(){
 const [start]=periodBounds(state.day,'month');
 const inPeriod=x=>x.day>=start&&x.day<=state.day;
 const rows=new Map();
 const get=name=>{
  if(!rows.has(name))rows.set(name,{name,revenue:0,direct:0});
  return rows.get(name);
 };
 for(const line of state.ledger.filter(inPeriod)){
  if(line.kind==='room') get('الغرف والإقامة').revenue+=line.amount;
  if(line.kind==='pos') get('الأغذية والمشروبات').revenue+=line.amount;
 }
 for(const sale of controlSales().filter(inPeriod)) get(departmentFor(sale.category)).revenue+=sale.amount;
 for(const mover of resources().movements.filter(inPeriod)){
  if(!['صرف','عجز','إتلاف','زيادة'].includes(mover.kind)) continue;
  const item=stockItem(mover.sku);
  const dept=/غرف|بياضات|تدبير|مغسلة|استقبال/.test(item.store)?'الغرف والإقامة':
   /مطبخ|مقهى|الأغذية|غسيل الأواني|المشروبات|مخبز/.test(item.store)?'الأغذية والمشروبات':departmentFor(item.store);
  get(dept).direct+=mover.amount*(mover.kind==='زيادة'?-1:1);
 }
 return [...rows.values()];
}
function postedBusinessPanel(){
 const rows=postedDepartmentSummary();
 const [start]=periodBounds(state.day,'month');
 const lines=journal(start,addDays(state.day,1));
 const wages=total(lines.filter(x=>x.debit==='مصروف رواتب وتعويضات'),x=>x.amount);
 const bank=total((resources().bankMoves||[]).filter(x=>x.day>=start&&x.day<=state.day&&x.kind==='expense'),x=>x.amount);
 const revenue=total(rows,x=>x.revenue), materials=total(rows,x=>x.direct);
 return displaySection('تشغيل الشهر حتى يوم العمل · المعاملات المسجلة',['القسم','إيراد مرحّل','تكلفة صرف مسجلة','نتيجة جزئية قبل رواتب ومرافق'],rows.map(x=>[
  x.name,pm(x.revenue),pm(x.direct),pm(x.revenue-x.direct)
 ]))+panel('تسوية حركة الشهر إلى صافي القيود المسجلة',
  row('الإيراد المرحّل',pm(revenue))+row('الصرف المباشر وفروقه',pm(materials))+row('أجور معتمدة ومقيدة',pm(wages))+
  row('مصروفات بنكية مسجلة',pm(bank))+row('صافي الحركة المتاحة',pm(revenue-materials-wages-bank))+
  '<p class="muted">تستند الحركة إلى المستندات المدخلة حتى اليوم. تظهر نتيجة الشهر المحاسبية بعد اعتماد بقية الرواتب والمرافق والتسويات والإهلاك.</p>');
}

function outletProfitPanel(p,f){
 const department=departmentalBudget(p,f).find(x=>x.name==='الأغذية والمشروبات');
 const names=p.venues.map(x=>x.name).concat('خدمة الغرف','الولائم والمشروبات وأخرى');
 const explicit=new Set(names.slice(0,-1));
 const food=f.services.filter(x=>departmentFor(x.category)==='الأغذية والمشروبات');
 const weights=names.map(name=>total(food.filter(x=>explicit.has(name)?x.category===name:!explicit.has(x.category)),x=>x.quantity));
 const staff=total(weights)?mixAllocate(department.payroll,weights):names.map((_,i)=>i?0:department.payroll);
 return displaySection('ربحية منافذ الأغذية والمشروبات · السنة',['المنفذ','إيراد','تكلفة الأصناف','عمالة مخصصة','مجمل الربح بعد العمالة'],names.map((name,i)=>{
  const group=food.filter(x=>explicit.has(name)?x.category===name:!explicit.has(x.category));
  const revenue=total(group,x=>x.revenue), cost=total(group,x=>x.cost);
  return [name,pm(revenue),pm(cost),pm(staff[i]),pm(revenue-cost-staff[i])];
 }))+ '<p class="muted">توزيع أجور قسم الأغذية والمشروبات والمطبخ المشترك على المنافذ بحسب وحدات الخدمة المتوقعة. تسجل الإدارة الفعلية ساعات العمالة حسب المنفذ عند الإقفال.</p>';
}
