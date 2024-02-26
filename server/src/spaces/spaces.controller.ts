import { z } from "zod";
import { SpacesService } from "./spaces.service";
import { Request, Response, Router } from "express";
import { blockNotVerifedUser } from "../middlewares/auth.middlewares";

export class SpacesController {
  public readonly router = Router();

  constructor(
    private readonly spacesService: SpacesService,
  ) {
    this.router.use("/spaces", blockNotVerifedUser);
    this.router.post("/spaces", this.createSpace.bind(this));
    this.router.patch("/spaces/:userId/:spacesId", this.updateNote.bind(this));
    this.router.get("/all-spaces", this.getAllSpaces.bind(this));
    this.router.get("/spaces/:spaceId", this.getSpace.bind(this));
    this.router.delete("/spaces/:spacesId", this.deleteNote.bind(this));
  }

  async createSpace(req: Request, res: Response) {
    if (!req.session.user) {
      return res.status(401).send({ errors: [{ message: "Unauthorized" }] });
    }
    const userId = req.session.user.user_id;
    const bodySchema = z.object({
      title: z.string(),
      description: z.string(),
      country: z.string(),
      city: z.string(),
      university: z.string(),
      category: z.string(),
    });
  
    const body = bodySchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).send({
        errors: body.error.issues,
      });
    }
    console.log("createSpace: ", body)
    try {
      const note = await this.spacesService.createSpace(userId, body.data);
      return res.status(201).send({ data: note });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        errors: [{ message: "Internal Server Error" }],
      });
    }
  }

  async updateNote(req: Request, res: Response) {}


  async deleteNote(req: Request, res: Response) {}

  async getAllSpaces(req: Request, res: Response) {
    // const note = await this.notesService.getAllNotes();
    //   console.log("getAllNotes() data: ", note);
    try {
      const space = await this.spacesService.getAllSpaces();
      console.log("getAllSpaces() data: ", space);
      
      return res.status(200).send({
        data: space,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        errors: [{ message: "Internal Server Error" }],
      });
    }
  }

  async getSpace(req: Request, res: Response) {
    const paramsSchema = z.object({
      spaceId: z.string(),
    });

    const params = paramsSchema.safeParse(req.params);
    console.log("getSpace() params: ", params);
    if (!params.success) {
      return res.status(400).send({
        errors: params.error.issues,
      });
    }

    
    try {
      console.log("getSpace() params.data.spaceId): ", params.data.spaceId);
      const space = await this.spacesService.getSpaceById(params.data.spaceId);
      console.log("getSpace() data: ", space);
      return res.status(200).send({
        data: space,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        errors: [{ message: "Internal Server Error" }],
      });
    }
  }

}