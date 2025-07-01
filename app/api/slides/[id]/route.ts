import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// DELETE endpoint to remove a slide by id
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return new Response("ID is required", { status: 400 });
    }

    // Delete the slide by ID
    const deletedSlide = await prisma.slide.delete({
      where: { id: String(id) },
    });

    return new Response(JSON.stringify(deletedSlide), { status: 200 });
  } catch (error) {
    console.error("Error deleting slide", error);
    return new Response("Error deleting slide", { status: 500 });
  }
}
