import type { Pool } from "pg";
import { Note, LikeNote, SavedNotes } from "../database";

export type CreateNoteDTO = {
  title: string;
  description: string;
  body: string;
  category: string;
};

export type CreateCommentNoteDTO = {
  comment: string;
};

// export type NoteCount = {
//   CountNote: number;
// }

export class NotesService {
  constructor(private readonly db: Pool) {}

  async getNotesForUser(userId: string) {
    const result = await this.db.query<Note>(
      `SELECT * from notes WHERE user_id = $1;`,
      [userId],
    );
    return result.rows;
  }

  async getNotesForSpace(spaceId: string) {
    const result = await this.db.query<Note>(
      `SELECT * from notes WHERE space_id = $1;`,
      [spaceId],
    );
    return result.rows;
  }


  async getCountNotesByUserId(userId: string): Promise<number> {
    const result = await this.db.query<{ countnote: number }>(
      `SELECT COUNT(*) AS countnote FROM notes WHERE user_id = $1;`,
      [userId],
    );
    return result.rows[0]?.countnote || 0;
  }
  
  
  // old code
  // async getCountNotesByUserId(userId: string){
  //   const result = await this.db.query<Note>(
  //     `SELECT COUNT(*) AS CountNote FROM notes WHERE user_id = $1;`,
  //     [userId],
  //   );
  //   return result.rows[0];
  // }

// async getCountNotesByUserId(userId: string){
//   const result = await this.db.query<NoteCount>(
//     `SELECT COUNT(*) AS CountNote FROM notes WHERE user_id = $1;`,
//     [userId],
//   );
//   console.log(result.rows[0]);
//   return result.rows[0]?.CountNote;
//}

  async getAllNotes(){
    const result = await this.db.query<Note>(
      `SELECT title, description, body, category, users.username, notes.user_id, note_id, notes.created_at, likes 
      FROM notes JOIN users ON notes.user_id = users.user_id`,
    );
    return result.rows;
  }

  async getNoteById(noteId: string) {
    const result = await this.db.query<Note>(
      `SELECT title, description, body, category, users.username, note_id, notes.user_id, notes.created_at, notes.edit_at, likes
      FROM notes JOIN users ON notes.user_id = users.user_id WHERE note_id = $1;`,
      [noteId],
    );
    return result.rows.at(0) || null;
  }

  async updateNote(noteId: string, userId: string, data: CreateNoteDTO) {
    const nowDate = new Date().toISOString();
    const result = await this.db.query<Note>(
      `UPDATE notes SET title = $3, description = $4, body = $5, category = $6, edit_at = $7 WHERE note_id = $1 AND user_id = $2 RETURNING *;`,
      [noteId, userId, data.title, data.description, data.body, data.category, nowDate],
    );
    return result.rows[0] as Note;
  }

  async createNote(userId: string, spaceId: string, data: CreateNoteDTO) {
    const result = await this.db.query<Note>(
      `INSERT INTO notes (user_id, space_id, title, description, body, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [userId, spaceId, data.title, data.description, data.body, data.category],
    );
    console.log("createNote spaceID", spaceId);
    return result.rows[0] as Note;
  }

  async deleteNoteById(noteId: string) {
    await this.db.query(`DELETE FROM notes WHERE note_id = $1;`, [
      noteId,
    ]);
  }

  // Like of post
  async likeForNote(noteId: string, likes: number) {
    const result = await this.db.query<Note>(
      `UPDATE notes SET likes = $2 WHERE note_id = $1 RETURNING *;`,
      [noteId, likes],
    );
    // return result.rows[0] as Post;
    return result.rows.at(0) || null;
  }

  async likeToNote(noteId: string, userId: string) {
    const result = await this.db.query<LikeNote>(
      `INSERT INTO likes_notes(note_id, user_id) VALUES ($1, $2) RETURNING *;`,
      [noteId, userId],
    );
    return result.rows[0] as LikeNote;
  }

  async checkLikeOfPost(noteId: string, userId: string) {
    const result = await this.db.query<LikeNote>(
      `SELECT * FROM likes_notes WHERE note_id = $1 AND user_id = $2 `,
      [noteId, userId],
    );
    // return result.rows[0] as Post;
    return result.rows.at(0) || null;
  }

// Comment of post

async createCommentForNote(noteId: string, userId: string, data: CreateCommentNoteDTO) {
  const result = await this.db.query<Note>(
    `INSERT INTO comments_notes (note_id, user_id, comment) VALUES ($1, $2, $3 ) RETURNING *;`,
    [noteId, userId, data.comment ],
  );
  return result.rows[0] as Note;
}

async getCommentNoteById(noteId: string) {
  const result = await this.db.query<Note>(
    `SELECT comments_notes.comment, users.username, comments_notes.created_at
    FROM comments_notes JOIN users ON comments_notes.user_id = users.user_id WHERE note_id = $1;`,
    [noteId],
  );
  // return result.rows.at(0) || null;
  return result.rows || [];
  }


  // Saved of post
async addSavedNoteToList(noteId: string, userId: string) {
  const result = await this.db.query<SavedNotes>(
    `INSERT INTO saved_notes(note_id, user_id) VALUES ($1, $2) RETURNING *;`,
    [noteId, userId],
  );
  return result.rows[0] as SavedNotes;
}

async checkSavedNote(noteId: string, userId: string) {
  const result = await this.db.query<SavedNotes>(
    `SELECT * FROM saved_notes WHERE note_id = $1 AND user_id = $2 `,
    [noteId, userId],
  );
  // return result.rows[0] as Post;
  return result.rows[0] as SavedNotes;
}

async getSavedNotesById(userId: string) {
  const result = await this.db.query<Note>(
    `SELECT saved_notes.note_id, saved_notes.user_id,  notes.body, users.username, notes.created_at
    FROM saved_notes 
    JOIN notes ON saved_notes.note_id = notes.note_id
    JOIN users ON notes.user_id = users.user_id 
    WHERE saved_notes.user_id = $1 `,
    [userId],
  );
  // return result.rows[0] as Post;
  return result.rows;
  // return result.rows.at(0) || null;
}

async deleteSavedNotesById(noteId: string, userId: string) {
  await this.db.query(`DELETE FROM saved_notes WHERE note_id = $1 AND user_id = $2`, 
  [noteId, userId]
  );
}

}
