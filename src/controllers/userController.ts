import User from "../models/user.model";
import { UpdateOne, deleteOne, findAll, findOne } from "./handleFactory";

export const getAllUsers = findAll(User);
export const getUser = findOne(User);
export const updateUser = UpdateOne(User);
export const deleteUser = deleteOne(User);
