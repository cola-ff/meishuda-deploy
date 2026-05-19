import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Products
    const p1 = await prisma.product.upsert({ where: { name: '每舒达I' }, update: {}, create: { name: '每舒达I', order: 1 } })
    const p2 = await prisma.product.upsert({ where: { name: '每舒达II' }, update: {}, create: { name: '每舒达II', order: 2 } })
    const p3 = await prisma.product.upsert({ where: { name: '每舒达易植' }, update: {}, create: { name: '每舒达易植', order: 3 } })

    const p1Models = [
      { name: 'MAF375085RC', spec: 'Φ3.5×8.5' }, { name: 'MAF375100RC', spec: 'Φ3.5×10' },
      { name: 'MAF375115RC', spec: 'Φ3.5×11.5' }, { name: 'MAF375130RC', spec: 'Φ3.5×13' },
      { name: 'MAF375150RC', spec: 'Φ3.5×15' }, { name: 'MAF400070RC', spec: 'Φ4.0×7' },
      { name: 'MAF400085RC', spec: 'Φ4.0×8.5' }, { name: 'MAF400100RC', spec: 'Φ4.0×10' },
      { name: 'MAF400115RC', spec: 'Φ4.0×11.5' }, { name: 'MAF400130RC', spec: 'Φ4.0×13' },
      { name: 'MAF400150RC', spec: 'Φ4.0×15' }, { name: 'MAF450070RC', spec: 'Φ4.5×7' },
      { name: 'MAF450085RC', spec: 'Φ4.5×8.5' }, { name: 'MAF450100RC', spec: 'Φ4.5×10' },
      { name: 'MAF450115RC', spec: 'Φ4.5×11.5' }, { name: 'MAF450130RC', spec: 'Φ4.5×13' },
      { name: 'MAF450150RC', spec: 'Φ4.5×15' }, { name: 'MAF500070RC', spec: 'Φ5.0×7' },
      { name: 'MAF500085RC', spec: 'Φ5.0×8.5' }, { name: 'MAF500100RC', spec: 'Φ5.0×10' },
      { name: 'MAF500115RC', spec: 'Φ5.0×11.5' }, { name: 'MAF500130RC', spec: 'Φ5.0×13' },
      { name: 'MAF500160RC', spec: 'Φ5.0×15' }, { name: 'MAF600070RC', spec: 'Φ6.0×7' },
      { name: 'MAF600085RC', spec: 'Φ6.0×8.5' }, { name: 'MAF600100RC', spec: 'Φ6.0×10' },
      { name: 'MAF600115RC', spec: 'Φ6.0×11.5' }, { name: 'MAF600130RC', spec: 'Φ6.0×13' },
      { name: 'MAF600160RC', spec: 'Φ6.0×15' },
    ]
    const p2Models = [
      { name: 'POF3508', spec: 'Φ3.75×8.5' }, { name: 'POF3510', spec: 'Φ3.75×10' },
      { name: 'POF3511', spec: 'Φ3.75×11.5' }, { name: 'POF3513', spec: 'Φ3.75×13' },
      { name: 'POF4007', spec: 'Φ4.2×7' }, { name: 'POF4008', spec: 'Φ4.2×8.5' },
      { name: 'POF4010', spec: 'Φ4.2×10' }, { name: 'POF4011', spec: 'Φ4.2×11.5' },
      { name: 'POF4013', spec: 'Φ4.2×13' }, { name: 'POF4507', spec: 'Φ4.55×7' },
      { name: 'POF4508', spec: 'Φ4.55×8.5' }, { name: 'POF4510', spec: 'Φ4.55×10' },
      { name: 'POF4511', spec: 'Φ4.55×11.5' }, { name: 'POF4513', spec: 'Φ4.55×13' },
      { name: 'POF5007', spec: 'Φ5.05×7' }, { name: 'POF5008', spec: 'Φ5.05×8.5' },
      { name: 'POF5010', spec: 'Φ5.05×10' }, { name: 'POF5011', spec: 'Φ5.05×11.5' },
      { name: 'POF5013', spec: 'Φ5.05×13' },
    ]
    const p3Models = [
      { name: 'AC3709N', spec: 'Φ3.7×8.5' }, { name: 'AC3710N', spec: 'Φ3.7×10' },
      { name: 'AC3711N', spec: 'Φ3.7×11.5' }, { name: 'AC3713N', spec: 'Φ3.7×13' },
      { name: 'AC4207', spec: 'Φ4.2×7' }, { name: 'AC4209', spec: 'Φ4.2×8.5' },
      { name: 'AC4210', spec: 'Φ4.2×10' }, { name: 'AC4211', spec: 'Φ4.2×11.5' },
      { name: 'AC4213', spec: 'Φ4.2×13' }, { name: 'AC4507', spec: 'Φ4.5×7' },
      { name: 'AC4509', spec: 'Φ4.5×8.5' }, { name: 'AC4510', spec: 'Φ4.5×10' },
      { name: 'AC4511', spec: 'Φ4.5×11.5' }, { name: 'AC4513', spec: 'Φ4.5×13' },
      { name: 'AC5007', spec: 'Φ5.0×7' }, { name: 'AC5009', spec: 'Φ5.0×8.5' },
      { name: 'AC5010', spec: 'Φ5.0×10' }, { name: 'AC5011', spec: 'Φ5.0×11.5' },
      { name: 'AC5013', spec: 'Φ5.0×13' },
    ]

    let count = 0
    for (let i = 0; i < p1Models.length; i++) {
      await prisma.productModel.upsert({
        where: { productId_name: { productId: p1.id, name: p1Models[i].name } },
        update: { spec: p1Models[i].spec, order: i + 1 },
        create: { ...p1Models[i], productId: p1.id, order: i + 1, unit: '颗' }
      }); count++
    }
    for (let i = 0; i < p2Models.length; i++) {
      await prisma.productModel.upsert({
        where: { productId_name: { productId: p2.id, name: p2Models[i].name } },
        update: { spec: p2Models[i].spec, order: i + 1 },
        create: { ...p2Models[i], productId: p2.id, order: i + 1, unit: '颗' }
      }); count++
    }
    for (let i = 0; i < p3Models.length; i++) {
      await prisma.productModel.upsert({
        where: { productId_name: { productId: p3.id, name: p3Models[i].name } },
        update: { spec: p3Models[i].spec, order: i + 1 },
        create: { ...p3Models[i], productId: p3.id, order: i + 1, unit: '颗' }
      }); count++
    }

    const customers = [
      { name: '南京学祥贸易有限公司', contact: '张经理', phone: '13800001111' },
      { name: '烟台尚美佳医疗器械有限公司', contact: '李经理', phone: '13800002222' },
      { name: '河南雅植美医疗器械有限公司', contact: '王经理', phone: '13800003333' },
      { name: '上海科安辰医疗科技有限公司', contact: '陈经理', phone: '13800004444' },
      { name: '河南必植医疗器械有限公司', contact: '赵经理', phone: '13800005555' },
      { name: '凯木（四川）口腔医院管理有限公司', contact: '刘经理', phone: '13800006666' },
      { name: '上海医齿通医疗器械有限公司', contact: '孙经理', phone: '13800007777' },
      { name: '甘肃凯土莱医疗科技有限公司', contact: '周经理', phone: '13800008888' },
      { name: '日照智康医疗器械有限公司', contact: '吴经理', phone: '13800009999' },
      { name: '宿迁市恒誉医疗器械有限公司', contact: '郑经理', phone: '13800010000' },
    ]
    for (const c of customers) {
      await prisma.customer.upsert({
        where: { name: c.name }, update: {},
        create: { ...c, password: '123456' }
      }); count++
    }

    return NextResponse.json({ success: true, message: `初始化完成：${count}条数据` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
