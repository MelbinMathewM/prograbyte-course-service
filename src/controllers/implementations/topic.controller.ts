import { HttpResponse } from "@/constants/response.constant";
import { HttpStatus } from "@/constants/status.constant";
import { ITopics } from "@/models/topic.model";
import { TopicService } from "@/services/implementations/topic.service";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { inject } from "inversify";
import { ITopicController } from "../interfaces/ITopic.controller";

export class TopicController implements ITopicController {
    constructor(@inject(TopicService) private _topicService: TopicService) { }

    async createTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { course_id, topics } = req.body;

            if (!course_id || !Array.isArray(topics)) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: HttpResponse.MISSING_OR_INVALID_FIELDS });
                return;
            }

            const savedTopics = await this._topicService.createTopic(course_id, req.body as ITopics);
            res.status(HttpStatus.CREATED).json(savedTopics);
        } catch (err) {
            next(err);
        }
    }

    async editTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { topicsId, topicId } = req.params;

            if (!topicsId || !topicId) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: HttpResponse.INVALID_CREDENTIALS });
                return;
            }

            const topic = await this._topicService.updateTopic(topicsId, topicId, req.body);

            res.status(HttpStatus.OK).json({ message: HttpResponse.TOPIC_UPDATED, topic })
        } catch (err) {
            next(err);
        }
    }

    async getTopics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { courseId } = req.params;

            const topics = await this._topicService.getTopics(courseId);

            res.status(HttpStatus.OK).json({topicList: topics});
        } catch (err) {
            next(err);
        }
    }

    async getTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { topicsId, topicId } = req.params;

            const topic = await this._topicService.getTopicById(topicsId, topicId);

            res.status(HttpStatus.OK).json(topic);
        } catch (err) {
            next(err)
        }
    }

    async removeTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { topicsId, topicId } = req.params;

            if (!topicsId || !topicId) {
                res.status(HttpStatus.BAD_REQUEST).json({ error: HttpResponse.INVALID_CREDENTIALS });
                return;
            }

            await this._topicService.deleteTopic(topicsId, topicId);

            res.status(HttpStatus.OK).json({ message: HttpResponse.TOPIC_DELETED });
        } catch (err) {
            next(err);
        }
    }

    async videoUrlToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { publicId } = req.query;

            if (!publicId) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: HttpResponse.PUBLIC_ID_NOT_FOUND });
                return;
            }

            const token = await this._topicService.getVideoToken(publicId as string);

            res.status(HttpStatus.OK).json({ token });
        } catch (err) {
            next(err)
        }
    }

    async getSecureUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token } = req.params;

            if (!token) {
                res.status(HttpStatus.BAD_REQUEST).json(HttpResponse.NO_TOKEN);
                return
            }
            
            res.status(HttpStatus.OK).json({ videoUrl: `/course/topics/proxy-stream/${token}` });
        } catch (err) {
            next(err)
        }
    }

    async proxyStream(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token } = req.params;
            const accessToken = req.headers.authorization?.replace("Bearer ", "");

            if (!token) {
                res.status(HttpStatus.UNAUTHORIZED).json(HttpResponse.NO_TOKEN);
                return;
            }

            const secureUrl = await this._topicService.getSecureVideo(token);

            const videoStream = await axios({
                method: "get",
                url: secureUrl,
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
                responseType: "stream",
            });

            res.setHeader("Content-Type", "video/mp4");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Accept-Ranges", "bytes");
            videoStream.data.pipe(res);

        } catch (err) {
            next(err);
        }
    }
}
