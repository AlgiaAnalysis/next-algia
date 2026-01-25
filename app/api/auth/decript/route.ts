import { NextRequest, NextResponse } from "next/server"
import { TripleDES } from '@/lib/crypto/tripleDES'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password')
    const tripleDES = new TripleDES()
    
    if (!password) {
        return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 })
    }
    const decryptedPassword = tripleDES.decrypt(password)
    return NextResponse.json({ decryptedPassword: decryptedPassword })
}