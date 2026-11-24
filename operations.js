'use strict';

function operatingInventory(day=state.day) {
 const previous=resources().closing[day];
 const plan=budgetFor(day,addDays(day,1));
 const stays=state.bookings.filter(b=>active(b)&&b.start<=day&&day<b.end);
 const blockedRooms=new Set(state.rooms.filter(r=>blocked(r.id)).map(r=>r.id));
 const held=new Set(stays.map(b=>b.room));
 const sellable=state.rooms.filter(r=>!blockedRooms.has(r.id)||held.has(r.id));
 const free=sellable.filter(r=>!held.has(r.id));
 const posted=state.ledger.filter(x=>x.day===day&&x.kind==='room');
 const projected=new Map(posted.map(x=>[x.booking,x.amount]));
 for(const b of stays) if(!projected.has(b.id)) projected.set(b.id,nightlyCharge(b,day));
 const arrivals=state.bookings.filter(b=>b.start===day&&!['ملغى','لم يحضر'].includes(b.status));
 const due=state.bookings.filter(b=>b.status==='مؤكد'&&b.start<=day&&day<b.end);
 const departures=state.bookings.filter(b=>(b.departedDay===day||!b.departedDay&&b.end===day)&&!['ملغى','لم يحضر'].includes(b.status));
 const behind=state.bookings.filter(b=>b.status==='مقيم'&&b.end<=day);
 const guaranteed=new Set([...projected].filter(([,n])=>n>0).map(([id])=>booking(id)?.room||id)).size;
 return {plan,stays,held,free,blockedRooms,posted,projected,arrivals,due,departures,behind,
  sold:previous?.sold??guaranteed,available:previous?.rooms??sellable.length,
  gross:total([...projected.values()]),postedRevenue:total(posted,x=>x.amount),
  physical:day===state.day?state.bookings.filter(b=>b.status==='مقيم').length:stays.length};
}
function operatingDashboard(){
 const day=state.day, x=operatingInventory(day), a=operationsSummary(day,addDays(day,1));
 const standby=x.due.filter(b=>!blocked(b.room)&&!occupied(b.room)&&room(b.room)?.clean==='جاهزة').length;
 const tasks=state.rooms.filter(r=>r.clean!=='جاهزة').length;
 const r=resources(), expected=cashTotals(day);
 const matched=r.counts[day]&&cashMethods.every(([key])=>r.counts[day][key]===expected[key]);
 const expectedArrivals=x.plan.bookings;
 const servicePlan=total(x.plan.services,s=>s.quantity);
 const measured=(x.available?percent(x.sold/x.available*100):'بانتظار قياس');
 return '<section class="hero"><p class="eyebrow">يوم العمل · '+esc(day)+'</p><h1>لوحة عمليات المنشأة</h1>'+
 '<p>إشغال الليلة من الحجوزات '+measured+' · مستهدف التشغيل '+percent(preferences.occupancy)+' · الإشغال اللحظي '+pn(x.physical)+' غرفة.</p></section>'+
 controlCards([['الليالي المتاحة للبيع',pn(x.available)],['الليالي المباعة على الدفاتر',pn(x.sold)],['غرف متاحة لحجز جديد',pn(x.free.length)],
 ['وصول اليوم · الإجمالي',pn(x.arrivals.length)],['مغادرة اليوم · الإجمالي',pn(x.departures.length)],['إيراد الغرف المتوقع من حجوزات الليلة',pm(x.gross)],
 ['إيراد الغرف المرحّل',pm(x.postedRevenue)],['إيراد الخدمات المرحّل',pm(a.pos)],['التحصيل المسجل',pm(a.payment)]])+
 '<div class="split">'+panel('الاستقبال والتدبير',
 row('الوصول في الخطة اليومية',pn(expectedArrivals))+row('وصول ينتظر التسجيل',pn(x.due.length))+
 row('الغرف الجاهزة للوصول المعلق',pn(standby)+' / '+pn(x.due.length))+row('مغادرات مستحقة لم تُسوَّ',pn(x.behind.length))+
 row('غرف للتنظيف أو للفحص',pn(tasks))+row('غرف عليها حجب صيانة',pn(x.blockedRooms.size))+
 action('go','الاستقبال','reception')+action('go','الغرف والتدبير','housekeeping'))+
 panel('المبيعات والرقابة',
 row('إيراد الغرف في الخطة اليومية',pm(x.plan.roomRevenue))+row('إيراد الغرف المثبت قبل الإقفال',pm(x.postedRevenue))+
 row('عمليات خدمات مسجلة / متوقعة',pn(a.posLines)+' / '+pn(servicePlan))+row('حالة مطابقة التحصيل',badge(matched?'مطابق':'بانتظار المطابقة',!matched))+
 row('أوامر شراء بانتظار الاستلام',pn(r.orders.filter(o=>o.status==='معتمد').length))+
 row('إجراءات تصحيحية مفتوحة',pn(r.incidents.filter(item=>item.status!=='مغلق').length))+
 action('go','أسعار ومبيعات الخدمات','servicePlan')+action('go','التحصيل والإقفال','folio'))+'</div>'+
 displaySection('الحجوزات المتوقعة للأيام المقبلة',['التاريخ','ليالي متاحة','مباعة على الدفاتر','الإشغال على الدفاتر','المخطط','غرف متبقية للبيع','إيراد محجوز'],forwardInventory(7))+
 performancePanel()+dashboardDirectory()+
 panel('آخر حركة تشغيل',state.audit.slice(0,8).map(x=>row(esc(x.label),esc(x.day))).join('')||'تظهر حركة الأقسام هنا فور تسجيلها.');
}
function forwardInventory(length){
 return Array.from({length},(_,i)=>{
  const day=addDays(state.day,i), x=operatingInventory(day);
  return [esc(day),pn(x.available),pn(x.sold),x.available?percent(x.sold/x.available*100):'بانتظار قياس',pn(x.plan.sold),pn(x.free.length),pm(x.gross)];
 });
}
let bookingHorizon='7';
function bookingOperations(view){
 const x=operatingInventory();
 const today=controlCards([['الليالي المباعة الليلة',pn(x.sold)],['المستهدف الليلة',pn(x.plan.sold)],['متاح للبيع الليلة',pn(x.free.length)],
 ['إيراد حجوزات الليلة',pm(x.gross)],['وصول يحتاج تسجيلًا',pn(x.due.length)],['مغادرة مستحقة',pn(x.behind.length)]]);
 return today+(view==='bookings'?panel('التوافر والحجوزات مقابل الخطة',
  choose('booking-horizon','مدة العرض',[['7','7 أيام'],['14','14 يومًا'],['30','30 يومًا']],bookingHorizon)+
  displaySection('أفق التوافر من سجل الحجوزات',['التاريخ','ليالي متاحة','مباعة على الدفاتر','الإشغال على الدفاتر','المخطط','متبقية للبيع','إيراد محجوز'],forwardInventory(Number(bookingHorizon)))):'');
}
document.addEventListener('change',event=>{
 if(event.target.name==='booking-horizon'){bookingHorizon=event.target.value;render();}
});

function seedOperatingDay() {
 if(state.operatingVersion) return;
 const day=state.day, previous=addDays(day,-1);
 const targetOccupied=Math.round(state.rooms.length*preferences.occupancy/100);
 const untouched=targetOccupied>=4&&state.audit.length===1&&state.audit[0].label==='إقفال يوم تشغيل تجريبي'&&
 state.bookings.filter(b=>b.status==='مقيم').length===targetOccupied&&state.closed.length===1&&state.closed[0]===previous;
 if(untouched){
  const units=controlProfile().units;
  const residents=state.bookings.filter(b=>b.status==='مقيم');
  const moving=residents.filter(b=>b.room!=='105'&&b.id!=='B102').slice(0,Math.max(2,Math.ceil(targetOccupied/controlProfile().averageStay)));
  for(const b of residents) if(b.room!=='105'){
   b.start=previous;
   b.arrived=previous;
   chargeNight(b,previous);
   if(!moving.includes(b)) ledger(b,'دفعة افتتاحية من عينة التشغيل',-nightlyCharge(b,previous),'payment',previous,'card','OPEN-'+b.id);
  }
  const already=state.bookings.filter(b=>b.status==='مؤكد'&&b.start===day);
  for(const [i,b] of moving.entries()) {
   b.end=day;
   if(i<already.length) continue;
   const start=day, end=addDays(day,2+i%3), segment=segments[i%segments.length];
   const unit=units.find(x=>x.name===room(b.room).type);
   const nightlyRates=Array.from({length:workDays(start,end)},(_,i)=>estimateRoomNight(unit,segment,addDays(start,i)));
   state.bookings.push({id:'ARR-'+b.room,guest:'حجز وصول تجريبي '+pn(i+1),room:b.room,start,end,segment:segment.key,source:segment.label,
    rate:Math.round(total(nightlyRates,x=>x.gross)/nightlyRates.length),nightlyRates,status:'مؤكد'});
  }
  // Reserving fewer future rooms than the daily target leaves capacity for booking pickup.
  for(let offset=1;offset<=14;offset++){
   const start=addDays(day,offset);
   const target=Math.max(Math.ceil(targetOccupied*0.62),targetOccupied-offset*2);
   const heldNow=new Set(state.bookings.filter(b=>active(b)&&b.start<=start&&start<b.end).map(b=>b.room));
   const options=state.rooms.filter(r=>!heldNow.has(r.id)&&!blocked(r.id));
   for(const [i,r] of options.slice(0,Math.max(0,target-heldNow.size)).entries()){
    const segment=[segments[0],segments[2],segments[4]][(offset+i)%3];
    const unit=units.find(x=>x.name===r.type);
    const night=estimateRoomNight(unit,segment,start);
    state.bookings.push({id:'BASE-'+offset+'-'+r.id,guest:'حجز مستقبلي تجريبي '+pn(offset)+'-'+r.id,room:r.id,start,end:addDays(start,1),
     segment:segment.key,source:segment.label,rate:night.gross,nightlyRates:[night],status:'مؤكد'});
   }
  }
  for(const event of state.events.filter(x=>x.status==='مؤكد')){
   const eventDate=event.start.slice(0,10);
   const eligible=state.bookings.filter(b=>b.status==='مؤكد'&&!b.eventId&&b.start<=eventDate&&eventDate<b.end);
   for(const b of eligible.slice(0,Math.min(2,event.rooms))) b.eventId=event.id;
  }
  const b=state.bookings.find(x=>x.id==='B102');
  const offered=dailyPlan().services.filter(x=>foodCovers.has(x.name)&&hotelOutlets.some(o=>o.name===x.category));
  for(const [i,item] of offered.entries()){
   const qty=Math.max(1,Math.round(item.quantity/dailyPlan().days*(i%2?0.20:0.31)));
   const ref='DEMO-POS-'+(i+1);
   const onRoom=i===2; const actualQty=onRoom?2:qty;
   resources().sales.push({day,name:item.name,category:item.category,price:item.price,qty:actualQty,amount:item.price*actualQty,booking:onRoom?b.id:undefined,method:onRoom?'folio':i%3?'card':'cash',ref});
   if(onRoom) ledger(b,item.name,item.price*actualQty,'service',day,undefined,ref);
  }
  const maintenanceSamples=[['199','حساس تكييف يحتاج اختبار','نظام تكييف الغرفة'],['225','بطارية قفل تحتاج تغيير','وحدة قفل الدخول'],['422','ضغط مياه غير مستقر','مجموعة تغذية الغرفة']];
  for(const [roomId,title,asset] of maintenanceSamples) if(room(roomId)&&!state.bookings.some(b=>b.room===roomId&&active(b))) state.maintenance.push({id:'DEMO-M-'+roomId,room:roomId,title,asset,owner:'الهندسة',status:'مفتوح'});
  state.assetStart=day;
  const count=cashTotals(previous);
  resources().closing[previous]={rooms:state.rooms.length,occupancy:residents.length,sold:residents.length,expected:count,count:{...count,note:'كشف افتتاحي تجريبي'}};
  state.audit.unshift({at:new Date().toISOString(),day,label:'تجهيز وردية تجريبية عند الإشغال المخطط'});
 }
 state.operatingVersion=1;
 localStorage.setItem(chosenKey(),JSON.stringify(state));
}
