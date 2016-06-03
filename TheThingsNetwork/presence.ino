#include "TheThingsUno.h"

// Set your app Credentials
const byte appEui[8] = { 0x70, 0xB3, 0xD5, 0x7E, 0xD0, 0x00, 0x01, 0xFF };
const byte appKey[16] = { 0xA7, 0x8F, 0xBB, 0x50, 0xF8, 0x14, 0x14, 0x0A, 0x2D, 0x42, 0x8C, 0x89, 0x01, 0xC5, 0x9D, 0xD7 };

#define debugSerial Serial
#define loraSerial Serial1

int echoPin = 0x07;
int trigPin = 0x08;

TheThingsUno ttu;

void setup()
{
  debugSerial.begin(115200);
  loraSerial.begin(57600);

  delay(1000);
  ttu.init(loraSerial, debugSerial); //Initializing...
  ttu.reset();
  ttu.join(appEui, appKey);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  delay(1000);
}

void loop() {

  long duration, distance;
  digitalWrite(trigPin, LOW);
  digitalWrite(trigPin, HIGH);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  distance = (duration/2) / 29.1;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.print("\n--------------------\n");

  // presence
  byte dBuf[3];
  dBuf[0] = (distance >> 8) & 0xff;
  dBuf[1] = distance & 0xff;
  dBuf[2] = 0x4;
  
  ttu.sendBytes(dBuf, 3);

  delay(3000);
}
