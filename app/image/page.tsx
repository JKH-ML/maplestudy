'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader } from 'lucide-react';

export default function ImageProcessingPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('blur');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableFilters, setAvailableFilters] = useState<string[]>(['blur', 'contour', 'grayscale']);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flask-hello-world-maplestudy.vercel.app/';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);

    const fileReader = new FileReader();
    fileReader.onload = () => setPreviewUrl(fileReader.result as string);
    fileReader.readAsDataURL(file);

    setProcessedImageUrl(null);
    setError(null);
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
  };

  const processImage = async () => {
    if (!selectedImage) {
      setError('이미지를 먼저 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('type', selectedFilter);

      const response = await fetch(`${API_URL}/api/process-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('이미지 처리 중 오류가 발생했습니다.');
      }

      const data = await response.json();

      if (data.status === 'success' && data.processed_image) {
        setProcessedImageUrl(`data:image/${selectedImage.type.split('/')[1]};base64,${data.processed_image}`);
      } else {
        throw new Error(data.error || '처리된 이미지를 받지 못했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(`${API_URL}/api/available-filters`);
        if (response.ok) {
          const data = await response.json();
          if (data.filters && Array.isArray(data.filters)) {
            setAvailableFilters(data.filters);
          }
        }
      } catch (err) {
        console.error('필터 목록을 가져오는 데 실패했습니다:', err);
      }
    };
    fetchFilters();
  }, [API_URL]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-4xl font-bold mb-10 text-center">🖼️ 이미지 처리</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 이미지 업로드 */}
        <Card>
          <CardHeader>
            <CardTitle>이미지 업로드</CardTitle>
            <CardDescription>처리할 이미지를 선택하세요.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            {selectedImage && (
              <p className="text-sm text-muted-foreground">
                선택된 파일: {selectedImage.name}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 필터 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>필터 선택</CardTitle>
            <CardDescription>적용할 필터를 선택하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="필터 선택" />
              </SelectTrigger>
              <SelectContent>
                {availableFilters.map((filter) => (
                  <SelectItem key={filter} value={filter}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* 처리 버튼 */}
      <div className="flex justify-center mt-8">
        <Button
          onClick={processImage}
          disabled={!selectedImage || loading}
          className="px-8 py-6 text-lg flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin w-5 h-5" />
              처리 중...
            </>
          ) : (
            '이미지 처리하기'
          )}
        </Button>
      </div>

      {error && (
        <div className="mt-4 text-center text-destructive">
          {error}
        </div>
      )}

      {/* 원본과 결과 이미지 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {previewUrl && (
          <Card>
            <CardHeader>
              <CardTitle>원본 이미지</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="relative w-full h-64">
                <Image
                  src={previewUrl}
                  alt="원본 이미지"
                  layout="fill"
                  objectFit="contain"
                  className="rounded"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {processedImageUrl && (
          <Card>
            <CardHeader>
              <CardTitle>처리된 이미지 ({selectedFilter})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative w-full h-64">
                <Image
                  src={processedImageUrl}
                  alt="처리된 이미지"
                  layout="fill"
                  objectFit="contain"
                  className="rounded"
                />
              </div>
              <Button asChild variant="secondary" className="w-full mt-2">
                <a href={processedImageUrl} download={`processed-${selectedFilter}-image.jpg`}>
                  이미지 다운로드
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
