#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
부산시 공공데이터 수집 스크립트

API:
1. FoodService - 부산 맛집 정보
2. InfoOfficeService - 부산 관광안내소 정보

국문 데이터만 수집하여 JSON 파일로 저장
"""

import requests
import json
import os
import time

API_KEY = "848aa09ddf04ceb201f9c78a4b9858ca5a1232d970cfe2eb1ed1acf58b000686"

def fetch_restaurants():
    """부산 맛집 데이터 수집"""
    url = "https://apis.data.go.kr/6260000/FoodService/getFoodKr"

    all_restaurants = []
    page_no = 1
    num_of_rows = 100  # 한 번에 100개씩

    print("📍 부산 맛집 데이터 수집 시작...")

    while True:
        params = {
            "serviceKey": API_KEY,
            "pageNo": page_no,
            "numOfRows": num_of_rows,
            "resultType": "json"
        }

        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            # 응답 구조 확인
            if not data.get('getFoodKr'):
                print(f"⚠️ 응답에 데이터가 없습니다 (페이지 {page_no})")
                break

            items = data['getFoodKr'].get('item', [])

            # 리스트가 아니면 리스트로 변환
            if isinstance(items, dict):
                items = [items]
            elif not items:
                print(f"✅ 모든 데이터 수집 완료 (총 {len(all_restaurants)}개)")
                break

            # 좌표 있는 것만 필터링하고 정규화
            for item in items:
                if item.get('LAT') and item.get('LNG'):
                    restaurant = {
                        'name': item.get('MAIN_TITLE', '이름 없음'),
                        'district': item.get('GUGUN_NM', ''),
                        'lat': float(item['LAT']),
                        'lng': float(item['LNG']),
                        'address': item.get('ADDR1', ''),
                        'description': item.get('ITEMCNTNTS', ''),
                        'phone': item.get('CNTCT_TEL', ''),
                        'type': 'restaurant'
                    }
                    all_restaurants.append(restaurant)

            print(f"  페이지 {page_no}: {len(items)}개 항목 수집 (좌표 있는 항목: {len([i for i in items if i.get('LAT')])}개)")

            # 다음 페이지
            page_no += 1
            time.sleep(0.5)  # API 부하 방지

            # 최대 10페이지 (1000개)로 제한
            if page_no > 10:
                break

        except requests.exceptions.RequestException as e:
            print(f"❌ API 요청 실패 (페이지 {page_no}): {e}")
            break
        except (KeyError, ValueError) as e:
            print(f"❌ 데이터 파싱 실패: {e}")
            break

    print(f"✅ 맛집 데이터 수집 완료: {len(all_restaurants)}개\n")
    return all_restaurants


def fetch_tourist_spots():
    """부산 관광안내소/관광지 데이터 수집"""
    url = "https://apis.data.go.kr/6260000/InfoOfficeService/getInfoOfficeKr"

    all_spots = []
    page_no = 1
    num_of_rows = 100

    print("🏖️ 부산 관광지 데이터 수집 시작...")

    while True:
        params = {
            "serviceKey": API_KEY,
            "pageNo": page_no,
            "numOfRows": num_of_rows,
            "resultType": "json"
        }

        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            # 응답 구조 확인
            if not data.get('getInfoOfficeKr'):
                print(f"⚠️ 응답에 데이터가 없습니다 (페이지 {page_no})")
                break

            items = data['getInfoOfficeKr'].get('item', [])

            # 리스트가 아니면 리스트로 변환
            if isinstance(items, dict):
                items = [items]
            elif not items:
                print(f"✅ 모든 데이터 수집 완료 (총 {len(all_spots)}개)")
                break

            # 좌표 있는 것만 필터링하고 정규화
            for item in items:
                if item.get('LAT') and item.get('LNG'):
                    spot = {
                        'name': item.get('MAIN_TITLE', '이름 없음'),
                        'district': item.get('GUGUN_NM', ''),
                        'lat': float(item['LAT']),
                        'lng': float(item['LNG']),
                        'address': item.get('ADDR1', ''),
                        'description': item.get('ITEMCNTNTS', ''),
                        'phone': item.get('CNTCT_TEL', ''),
                        'type': 'touristSpot'
                    }
                    all_spots.append(spot)

            print(f"  페이지 {page_no}: {len(items)}개 항목 수집 (좌표 있는 항목: {len([i for i in items if i.get('LAT')])}개)")

            # 다음 페이지
            page_no += 1
            time.sleep(0.5)  # API 부하 방지

            # 최대 10페이지로 제한
            if page_no > 10:
                break

        except requests.exceptions.RequestException as e:
            print(f"❌ API 요청 실패 (페이지 {page_no}): {e}")
            break
        except (KeyError, ValueError) as e:
            print(f"❌ 데이터 파싱 실패: {e}")
            break

    print(f"✅ 관광지 데이터 수집 완료: {len(all_spots)}개\n")
    return all_spots


if __name__ == "__main__":
    print("=" * 60)
    print("부산시 공공데이터 수집 시작")
    print("=" * 60 + "\n")

    # 데이터 수집
    restaurants = fetch_restaurants()
    tourist_spots = fetch_tourist_spots()

    # data 디렉토리 생성
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(data_dir, exist_ok=True)

    # JSON 파일로 저장
    restaurants_path = os.path.join(data_dir, 'busan_restaurants.json')
    tourist_spots_path = os.path.join(data_dir, 'busan_tourist_spots.json')

    with open(restaurants_path, 'w', encoding='utf-8') as f:
        json.dump(restaurants, f, ensure_ascii=False, indent=2)

    with open(tourist_spots_path, 'w', encoding='utf-8') as f:
        json.dump(tourist_spots, f, ensure_ascii=False, indent=2)

    print("=" * 60)
    print("저장 완료!")
    print("=" * 60)
    print(f"📁 맛집: {restaurants_path}")
    print(f"   └─ {len(restaurants)}개 데이터")
    print(f"📁 관광지: {tourist_spots_path}")
    print(f"   └─ {len(tourist_spots)}개 데이터")
    print("=" * 60)
