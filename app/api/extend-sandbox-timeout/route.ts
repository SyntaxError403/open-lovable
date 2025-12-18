import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/config/app.config';

declare global {
  var activeSandbox: any;
}

export async function POST(request: NextRequest) {
  try {
    const { sandboxId, additionalMinutes } = await request.json();
    
    if (!global.activeSandbox) {
      return NextResponse.json({
        success: false,
        error: 'No active sandbox to extend'
      }, { status: 404 });
    }

    // Calculate additional time in milliseconds (default to config timeout)
    const additionalMs = additionalMinutes 
      ? additionalMinutes * 60 * 1000 
      : appConfig.vercelSandbox.timeoutMs;

    try {
      await global.activeSandbox.extendTimeout(additionalMs);
      console.log(`[extend-sandbox-timeout] Extended sandbox timeout by ${additionalMs / 1000 / 60} minutes`);
      
      return NextResponse.json({
        success: true,
        message: `Sandbox timeout extended by ${additionalMs / 1000 / 60} minutes`
      });
    } catch (error) {
      console.error('[extend-sandbox-timeout] Failed to extend timeout:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to extend sandbox timeout'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[extend-sandbox-timeout] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

