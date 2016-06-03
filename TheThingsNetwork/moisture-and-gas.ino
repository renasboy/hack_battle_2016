#include "TheThingsUno.h"

// Set your app Credentials
const byte appEui[8] = { 0x70, 0xB3, 0xD5, 0x7E, 0xD0, 0x00, 0x01, 0xFF };
const byte appKey[16] = { 0x86, 0x4D, 0x10, 0x75, 0x6E, 0xC7, 0x27, 0x5B, 0x5B, 0x60, 0x97, 0xAE, 0x01, 0xAC, 0x9D, 0x02 };

#define debugSerial Serial
#define loraSerial Serial1

TheThingsUno ttu;

int analogInput = A2;
int analogOutput = 0;

int gAnalogInput = A3;
int gAnalogOutput = 0;

void setup()
{
  debugSerial.begin(115200);
  loraSerial.begin(57600);

  delay(1000);
  ttu.init(loraSerial, debugSerial); //Initializing...
  ttu.reset();
  ttu.join(appEui, appKey);

  delay(6000);
  ttu.showStatus();
  debugSerial.println("Setup for The Things Network complete");

  delay(1000);
  Serial.begin(9600);
  pinMode(2,INPUT);
}

void loop() {
  analogOutput = analogRead(analogInput);
  gAnalogOutput = analogRead(gAnalogInput);

  Serial.print("Analog: ");
  Serial.print(analogOutput);
  Serial.print("\n");

  Serial.print("\n--------------------\n");

  Serial.print("Gas Analog: ");
  Serial.print(gAnalogOutput);
  Serial.print("\n");

  Serial.print("\n--------------------\n");

  // moisture
  byte gBuf[3];
  gBuf[0] = (analogOutput >> 8) & 0xff;
  gBuf[1] = analogOutput & 0xff;
  gBuf[2] = 0x2;
  ttu.sendBytes(gBuf, 3);
  delay(3000);

  // gas
  byte buf[3];
  buf[0] = (gAnalogOutput >> 8) & 0xff;
  buf[1] = gAnalogOutput & 0xff;
  buf[2] = 0x3;
  ttu.sendBytes(buf, 3);
  delay(3000);
}
