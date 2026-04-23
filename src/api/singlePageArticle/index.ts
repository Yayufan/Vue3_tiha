import request from "@/utils/request";
import { AxiosPromise } from "axios";

/**
 * 獲取單一頁面文章
 * @param id 
 * @returns 
 */
export function getSinglePageArticleApi(path: string): AxiosPromise {
  return request({
    url: `/single-page-article/by-path`,
    method: "get",
    params: {
      path
    }
  });
}

/**
 * 更新單一頁面文章
 * @param data 
 * @returns 
 */
export function updateSinglePageArticleApi(data: any): AxiosPromise {
  return request({
    url: "/single-page-article",
    method: "put",
    data
  });
}