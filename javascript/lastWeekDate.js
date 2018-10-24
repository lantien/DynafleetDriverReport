var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
, day = beforeOneWeek.getDay()
, diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
, lastMonday = new Date(beforeOneWeek.setDate(diffToMonday))
, midWeek = new Date(beforeOneWeek.setDate(diffToMonday + 3))
, lastSunday = new Date(beforeOneWeek.setDate(diffToMonday + 6));


lastMonday.setHours(0,0,0,0);
lastSunday.setHours(23,59,59,59);
